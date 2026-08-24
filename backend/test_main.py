import pytest
from fastapi.testclient import TestClient
import os

# We need to set a dummy api key for testing if not present, to prevent genai crashes.
os.environ.setdefault("GEMINI_API_KEY", "dummy_key")

from main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to ECHO API"}

def test_pulse_endpoint():
    response = client.get("/pulse")
    assert response.status_code == 200
    data = response.json()
    assert "risks" in data
    assert "deadlines" in data
    assert "new_documents" in data
    assert "active_team" in data
    assert "discussed_project" in data

def test_graph_endpoint():
    response = client.get("/graph")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data

def test_chat_empty_index():
    # Because the FAISS index is empty initially, this should hit the fallback logic
    response = client.post("/chat", json={"query": "what is project echo?"})
    assert response.status_code == 200
    data = response.json()
    assert "empty" in data["answer"].lower()
