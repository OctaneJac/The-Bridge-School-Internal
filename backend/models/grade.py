from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from core.db import Base


class Grade(Base):
    __tablename__ = "grades"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    marks_obtained = Column(Integer, nullable=False)
    
    # Relationships
    exam = relationship("Exam", back_populates="grades")
    student = relationship("Student", back_populates="grades")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('exam_id', 'student_id', name='unq_exam_student'),
    )

