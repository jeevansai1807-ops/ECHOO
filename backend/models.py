from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    content = Column(Text)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)

    entities = relationship("Entity", back_populates="document")

class Entity(Base):
    __tablename__ = "entities"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    name = Column(String, index=True)
    label = Column(String, index=True) # Person, Project, Date, Org

    document = relationship("Document", back_populates="entities")
