from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.db import Base


class TeacherCourse(Base):
    __tablename__ = "teacher_courses"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=True) # key change
    
    # Relationships
    teacher = relationship("User", back_populates="teacher_courses")
    course = relationship("Course", back_populates="teacher_courses")
    class_model = relationship("Class") # Add relationship to Class if needed
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('teacher_id', 'course_id', 'class_id', name='unq_teacher_course_class'),
    )

