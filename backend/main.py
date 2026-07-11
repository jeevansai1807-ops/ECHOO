from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="ECHO API", description="Enterprise Cognitive Hub & Operations MVP")

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For MVP, allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to ECHO API"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    # TODO: Process file, extract text, NLP extraction, FAISS indexing
    return {"filename": file.filename, "status": "processed"}

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
    # TODO: Retrieve from FAISS, call Gemini
    # Mocking the rich response for the MVP Hackathon presentation
    return {
        "answer": "Project Apollo is delayed primarily because of a pending vendor payment. Additionally, the latest meeting notes indicate a shortage of materials which might push the timeline back further.",
        "sources": ["Meeting_12.pdf", "Budget.xlsx"],
        "confidence_score": 94,
        "related_entities": ["Rahul", "Vendor ABC", "Finance Dept"],
        "suggested_followups": [
            "Who is responsible for the vendor payment?",
            "What materials are in shortage?",
            "Show me the latest budget report."
        ]
    }

@app.get("/graph")
def get_graph():
    # Return graph structure for React Flow
    return {
        "nodes": [
            {"id": "1", "data": {"label": "Project Apollo"}, "position": {"x": 250, "y": 5}},
            {"id": "2", "data": {"label": "Rahul"}, "position": {"x": 100, "y": 100}},
            {"id": "3", "data": {"label": "Budget.pdf"}, "position": {"x": 400, "y": 100}}
        ],
        "edges": [
            {"id": "e1-2", "source": "1", "target": "2", "label": "Manager"},
            {"id": "e1-3", "source": "1", "target": "3", "label": "Related Document"}
        ]
    }

@app.get("/pulse")
def get_organization_pulse():
    return {
        "risks": [{"project": "Project Apollo", "status": "At Risk", "reason": "Budget Delay"}],
        "deadlines": 5,
        "new_documents": 12,
        "active_team": "Engineering",
        "discussed_project": "Project Apollo"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
