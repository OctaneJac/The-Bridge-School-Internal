from sqlalchemy import Column, Integer, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
import enum
from core.db import Base


class StudentStatusEnum(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    GRADUATED = "graduated"
    TRANSFERRED = "transferred"


class StudentClass(Base):
    __tablename__ = "student_classes"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(StudentStatusEnum), nullable=False, default=StudentStatusEnum.ACTIVE)
    
    # Relationships
    student = relationship("Student", back_populates="student_classes")
    class_model = relationship("Class", back_populates="student_classes")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('student_id', 'class_id', name='unq_student_class'),
    )

