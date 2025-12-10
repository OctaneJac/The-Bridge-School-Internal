from sqlalchemy import Column, String, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from core.db import Base


class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)  # e.g. 2025–2026
    branch_id = Column(Integer, ForeignKey("branches.id", ondelete="CASCADE"))
    start_date = Column(Date)
    end_date = Column(Date)
    
    # Relationships
    branch = relationship("Branch", back_populates="sessions")
    classes = relationship("Class", back_populates="session", cascade="all, delete-orphan")
    courses = relationship("Course", back_populates="session", cascade="all, delete-orphan")
    exams = relationship("Exam", back_populates="session", cascade="all, delete-orphan")

