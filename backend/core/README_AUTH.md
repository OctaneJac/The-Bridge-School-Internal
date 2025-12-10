# Authentication

This module provides JWT token validation for NextAuth tokens from the frontend.

## Setup

1. Add `NEXTAUTH_SECRET` to your `.env` file (must match the frontend's `NEXTAUTH_SECRET`):
```env
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## Usage

### Basic Authentication

Protect a route with authentication:

```python
from fastapi import APIRouter, Depends
from core.auth import get_current_user, TokenData

router = APIRouter()

@router.get("/protected")
async def protected_route(current_user: TokenData = Depends(get_current_user)):
    return {
        "message": "This is a protected route",
        "user_id": current_user.id,
        "role": current_user.role
    }
```

### Role-Based Access Control

Require specific roles:

```python
from core.auth import require_role, TokenData

@router.get("/admin-only")
async def admin_route(current_user: TokenData = Depends(require_role(["admin", "super_admin"]))):
    return {"message": "Admin access granted"}

@router.get("/teacher-only")
async def teacher_route(current_user: TokenData = Depends(require_role(["teacher"]))):
    return {"message": "Teacher access granted"}
```

## Token Structure

The JWT token from NextAuth contains:
- `id`: User UUID
- `role`: User role ("teacher", "admin", or "super_admin")
- `first_name`: User's first name (optional)
- `last_name`: User's last name (optional)
- `branch_id`: Branch ID (optional)
- `email`: User's email (optional)
- `name`: User's name (optional)

## Frontend Integration

From the frontend, send the token in the Authorization header:

```typescript
import { getToken } from "next-auth/jwt";

const token = await getToken({ req });
const response = await fetch("/api/v1/protected", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

Or using NextAuth's session:

```typescript
import { getSession } from "next-auth/react";

const session = await getSession();
const token = session?.accessToken; // If using accessToken
```

