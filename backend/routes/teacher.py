from fastapi import APIRouter, Depends
from core.auth import get_current_user, require_role, TokenData

router = APIRouter(prefix="/teacher", tags=["teacher"])


@router.get("/")
async def teacher_root(current_user: TokenData = Depends(require_role(["teacher"]))):
    """Teacher routes root endpoint - requires teacher role"""
    return {
        "message": "Teacher routes",
        "user": {
            "id": current_user.id,
            "role": current_user.role,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "branch_id": current_user.branch_id
        }
    }

