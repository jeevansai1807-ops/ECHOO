from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Optional
import os
import io
import faiss
import numpy as np
import google.generativeai as genai
from dotenv import load_dotenv

from database import engine, Base, get_db
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
from services import extract_text_from_pdf, chunk_text, extract_entities
import datetime

load_dotenv()

# Setup GenAI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="ECHO API", description="Enterprise Cognitive Hub & Operations MVP")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup Database
models.Base.metadata.create_all(bind=engine)

# Setup FAISS (In-memory)
embedding_dim = 768  # text-embedding-004 has 768 dimensions
index = faiss.IndexFlatL2(embedding_dim)
chunk_metadata = [] # List to store dicts: {"text": str, "source": str}

@app.get("/")
def read_root():
    return {"message": "Welcome to ECHO API"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    file_bytes = await file.read()
    if file.filename.endswith(".pdf"):
        text = extract_text_from_pdf(file_bytes)
    else:
        text = file_bytes.decode("utf-8")
    
    # Chunking
    chunks = chunk_text(text, chunk_size=500, overlap=100)
    
    # Store document in DB
    db_doc = models.Document(filename=file.filename, content=text)
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # FAISS Indexing
    if chunks:
        # Generate embeddings
        response = genai.embed_content(
            model="models/text-embedding-004",
            content=chunks,
            task_type="retrieval_document",
        )
        embeddings = np.array(response['embedding'], dtype=np.float32)
        index.add(embeddings)
        
        # Store metadata
        for chunk in chunks:
            chunk_metadata.append({"text": chunk, "source": file.filename})
    
    # Extract Entities and save
    extracted = extract_entities(text)
    for ent in extracted:
        db_ent = models.Entity(document_id=db_doc.id, name=ent.name, label=ent.label)
        db.add(db_ent)
    db.commit()
    
    return {"filename": file.filename, "status": "processed", "chunks": len(chunks), "entities": len(extracted)}

class ChatRequest(BaseModel):
    query: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]
    confidence_score: int
    related_entities: List[str]
    suggested_followups: List[str]

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    if index.ntotal == 0:
        return ChatResponse(
            answer="The knowledge base is currently empty. Please upload some documents first.",
            sources=[],
            confidence_score=0,
            related_entities=[],
            suggested_followups=[]
        )
    
    # Embed query
    query_embed_res = genai.embed_content(
        model="models/text-embedding-004",
        content=request.query,
        task_type="retrieval_query",
    )
    query_embedding = np.array([query_embed_res['embedding']], dtype=np.float32)
    
    # Search FAISS
    k = min(3, index.ntotal)
    distances, indices = index.search(query_embedding, k)
    
    context_chunks = []
    sources = set()
    for idx in indices[0]:
        if idx != -1 and idx < len(chunk_metadata):
            meta = chunk_metadata[idx]
            context_chunks.append(meta["text"])
            sources.add(meta["source"])
            
    context_str = "\n\n".join(context_chunks)
    
    # Call Gemini
    prompt = f"""You are ECHO, an enterprise assistant. Answer the user's query based ONLY on the provided context. If the answer is not in the context, say so.
    
Context:
{context_str}

User Query: {request.query}

Format your response exactly as a JSON object matching this schema:
{{
  "answer": "Your detailed answer",
  "confidence_score": 90,
  "related_entities": ["Entity1", "Entity2"],
  "suggested_followups": ["Question 1?", "Question 2?"]
}}
"""
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content(
        prompt,
        generation_config=genai.GenerationConfig(response_mime_type="application/json")
    )
    
    import json
    try:
        data = json.loads(response.text)
        return ChatResponse(
            answer=data.get("answer", "No answer generated."),
            sources=list(sources),
            confidence_score=data.get("confidence_score", 0),
            related_entities=data.get("related_entities", []),
            suggested_followups=data.get("suggested_followups", [])
        )
    except Exception as e:
        return ChatResponse(
            answer=response.text,
            sources=list(sources),
            confidence_score=50,
            related_entities=[],
            suggested_followups=[]
        )

@app.get("/graph")
def get_graph(db: Session = Depends(get_db)):
    nodes = []
    edges = []
    
    docs = db.query(models.Document).all()
    entities = db.query(models.Entity).all()
    
    # Add document nodes
    for doc in docs:
        nodes.append({"id": f"doc_{doc.id}", "data": {"label": doc.filename}, "type": "document", "position": {"x": 0, "y": 0}})
        
    # Add entity nodes and edges
    added_entities = {}
    for ent in entities:
        ent_id = f"ent_{ent.name}"
        if ent_id not in added_entities:
            node_type = "person" if ent.label == "PERSON" else "project" if ent.label == "ORG" else "entity"
            nodes.append({"id": ent_id, "data": {"label": ent.name}, "type": node_type, "position": {"x": 0, "y": 0}})
            added_entities[ent_id] = True
            
        edges.append({
            "id": f"e_doc_{ent.document_id}_{ent_id}",
            "source": f"doc_{ent.document_id}",
            "target": ent_id,
            "label": "mentions",
            "animated": True
        })
        
    return {"nodes": nodes, "edges": edges}

@app.get("/pulse")
def get_organization_pulse(db: Session = Depends(get_db)):
    # Total documents ingested today
    today = datetime.datetime.utcnow().date()
    docs_today = db.query(models.Document).filter(
        models.Document.upload_date >= datetime.datetime.combine(today, datetime.time.min)
    ).count()
    
    # Most discussed project
    top_org = db.query(models.Entity.name, func.count(models.Entity.id).label('count'))\
        .filter(models.Entity.label == 'ORG')\
        .group_by(models.Entity.name)\
        .order_by(func.count(models.Entity.id).desc()).first()
        
    active_project = top_org.name if top_org else "None"
    
    # Most active team
    top_person = db.query(models.Entity.name, func.count(models.Entity.id).label('count'))\
        .filter(models.Entity.label == 'PERSON')\
        .group_by(models.Entity.name)\
        .order_by(func.count(models.Entity.id).desc()).first()
        
    active_team = top_person.name if top_person else "None"
    
    risks = []
    deadlines = 0
    if top_org:
        risks.append({"project": top_org.name, "status": "At Risk", "reason": "Mentioned frequently in recent docs"})
        
    dates_count = db.query(models.Entity).filter(models.Entity.label == 'DATE').count()
    deadlines = dates_count 

    return {
        "risks": risks,
        "deadlines": deadlines,
        "new_documents": docs_today,
        "active_team": active_team,
        "discussed_project": active_project
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
