from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional, List
from pydantic import BaseModel
from core.config import settings

# HTTP Bearer token scheme
security = HTTPBearer()


class TokenData(BaseModel):
    """Token payload structure matching NextAuth JWT"""
    id: str
    role: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    branch_id: Optional[int] = None
    email: Optional[str] = None
    name: Optional[str] = None
    iat: Optional[int] = None  # Issued at
    exp: Optional[int] = None  # Expiration time


def verify_token(token: str) -> TokenData:
    """
    Verify and decode a NextAuth JWT token.
    
    Args:
        token: The JWT token string
        
    Returns:
        TokenData: Decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    if not settings.NEXTAUTH_SECRET:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="NEXTAUTH_SECRET not configured"
        )
    
    try:
        # Decode and verify the JWT token
        payload = jwt.decode(
            token,
            settings.NEXTAUTH_SECRET,
            algorithms=[settings.ALGORITHM]
        )
        
        # Extract token data
        token_id = payload.get("id")
        if token_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user id"
            )
        
        return TokenData(
            id=token_id,
            role=payload.get("role"),
            first_name=payload.get("first_name"),
            last_name=payload.get("last_name"),
            branch_id=payload.get("branch_id"),
            email=payload.get("email"),
            name=payload.get("name"),
            iat=payload.get("iat"),
            exp=payload.get("exp")
        )
        
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    FastAPI dependency to get the current authenticated user from JWT token.
    
    Usage:
        @router.get("/protected")
        async def protected_route(current_user: TokenData = Depends(get_current_user)):
            return {"user_id": current_user.id, "role": current_user.role}
    
    Args:
        credentials: HTTP Bearer token credentials from Authorization header
        
    Returns:
        TokenData: Decoded token data with user information
    """
    token = credentials.credentials
    return verify_token(token)


def require_role(allowed_roles: List[str]):
    """
    Create a dependency that requires specific roles.
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(current_user: TokenData = Depends(require_role(["admin", "super_admin"]))):
            return {"message": "Admin access granted"}
    
    Args:
        allowed_roles: List of allowed roles
        
    Returns:
        Dependency function that validates role
    """
    def role_checker(current_user: TokenData = Depends(get_current_user)) -> TokenData:
        if not current_user.role or current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {allowed_roles}"
            )
        return current_user
    
    return role_checker

