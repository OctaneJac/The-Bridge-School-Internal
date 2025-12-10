from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from core.db import Base


class ClassCourse(Base):
    __tablename__ = "class_courses"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    
    # Relationships
    class_model = relationship("Class", back_populates="class_courses")
    course = relationship("Course", back_populates="class_courses")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('class_id', 'course_id', name='unq_class_course'),
    )

