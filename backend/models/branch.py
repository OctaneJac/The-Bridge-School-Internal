from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.db import Base


class Branch(Base):
    __tablename__ = "branches"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    address = Column(String(500))
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="branch")
    students = relationship("Student", back_populates="branch", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="branch", cascade="all, delete-orphan")
    classes = relationship("Class", back_populates="branch", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="branch", cascade="all, delete-orphan")

