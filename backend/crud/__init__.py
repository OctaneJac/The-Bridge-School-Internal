# CRUD operations will be added here

from .classes_branch import router as classes_branch_router
from .teachers_branch import router as teachers_branch_router

__all__ = ["classes_branch_router", "teachers_branch_router"]
