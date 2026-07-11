import spacy
import PyPDF2
from pydantic import BaseModel
import io

# Load English tokenizer, tagger, parser and NER
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spacy model...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

class ExtractedEntity(BaseModel):
    name: str
    label: str

def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
    text = ""
    for page in reader.pages:
        text += page.extract_text() + "\n"
    return text

def extract_entities(text: str) -> list[ExtractedEntity]:
    doc = nlp(text)
    entities = []
    seen = set()
    for ent in doc.ents:
        if ent.label_ in ["PERSON", "ORG", "DATE", "GPE", "WORK_OF_ART", "EVENT"]:
            if ent.text not in seen:
                seen.add(ent.text)
                entities.append(ExtractedEntity(name=ent.text, label=ent.label_))
    return entities

def build_graph_from_entities(document_name: str, entities: list[ExtractedEntity]):
    # This is a stub for building the graph edges based on extracted entities
    # For MVP, we will link the Document to all entities found within it.
    nodes = [{"id": document_name, "label": document_name, "type": "Document"}]
    edges = []
    
    for i, ent in enumerate(entities):
        node_id = f"ent_{i}"
        nodes.append({"id": node_id, "label": ent.name, "type": ent.label})
        edges.append({"source": document_name, "target": node_id, "label": "mentions"})
        
    return {"nodes": nodes, "edges": edges}
