from sqlalchemy import Column, Integer, Date, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from core.db import Base


class AttendanceStatusEnum(str, enum.Enum):
    PRESENT = "present"
    ABSENT = "absent"


class AttendanceRecord(Base):
    __tablename__ = "attendance_records"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    class_id = Column(Integer, ForeignKey("classes.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("students.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    status = Column(Enum(AttendanceStatusEnum), nullable=False)
    teacher_id = Column(UUID(as_uuid=True), ForeignKey("User.id", ondelete="SET NULL"))
    
    # Relationships
    class_model = relationship("Class", back_populates="attendance_records")
    student = relationship("Student", back_populates="attendance_records")
    teacher = relationship("User", back_populates="attendance_records")
    
    # Unique constraint
    __table_args__ = (
        UniqueConstraint('student_id', 'class_id', 'date', name='unq_student_class_date'),
    )

