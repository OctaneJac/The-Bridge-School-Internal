from fastapi import APIRouter, Depends
from core.auth import get_current_user, require_role, TokenData

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/")
async def admin_root(current_user: TokenData = Depends(require_role(["admin", "super_admin"]))):
    """Admin routes root endpoint - requires admin or super_admin role"""
    return {
        "message": "Admin routes",
        "user": {
            "id": current_user.id,
            "role": current_user.role,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "branch_id": current_user.branch_id
        }
    }

