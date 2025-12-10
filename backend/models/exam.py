from sqlalchemy import Column, String, Integer, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.db import Base


class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"))
    session_id = Column(Integer, ForeignKey("sessions.id", ondelete="CASCADE"))
    name = Column(String(255), nullable=False)
    max_marks = Column(Integer, nullable=False)
    exam_date = Column(Date)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    course = relationship("Course", back_populates="exams")
    session = relationship("Session", back_populates="exams")
    grades = relationship("Grade", back_populates="exam", cascade="all, delete-orphan")

