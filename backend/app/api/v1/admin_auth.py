from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import timedelta

from app.database import get_db
from app.schemas.admin import AdminLogin, AdminToken, AdminUserCreate, AdminUserResponse
from app.services.admin_service import AdminService
from app.utils.auth import create_access_token, get_current_admin, ACCESS_TOKEN_EXPIRE_MINUTES
from app.models.admin import AdminUser

router = APIRouter(prefix="/admin/auth", tags=["Admin Authentication"])


@router.post("/login", response_model=AdminToken)
async def admin_login(
    credentials: AdminLogin,
    db: AsyncSession = Depends(get_db)
):
    """Admin login endpoint"""
    import logging
    logger = logging.getLogger(__name__)

    logger.info(f"Login attempt for username: {credentials.username}")

    admin = await AdminService.authenticate_admin(
        db, credentials.username, credentials.password
    )

    if not admin:
        logger.warning(f"Failed login attempt for username: {credentials.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    logger.info(f"Successful login for username: {credentials.username}")

    # Create access token
    access_token = create_access_token(
        data={"sub": str(admin.id), "role": admin.role},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return AdminToken(
        access_token=access_token,
        admin_id=admin.id,
        username=admin.username,
        role=admin.role
    )


@router.post("/register", response_model=AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def register_admin(
    admin_data: AdminUserCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Register a new admin user (requires existing admin authentication)"""
    # Check if admin already has required role
    if current_admin.role not in ["admin", "manager"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or manager can create new admin users"
        )

    # Check if username already exists
    existing_admin = await AdminService.get_admin_by_username(db, admin_data.username)
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Check if email already exists
    existing_email = await AdminService.get_admin_by_email(db, admin_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    admin = await AdminService.create_admin(db, admin_data)
    return admin


@router.get("/me", response_model=AdminUserResponse)
async def get_current_admin_info(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get current admin user information"""
    return current_admin


@router.post("/logout")
async def admin_logout():
    """Admin logout endpoint (client should discard token)"""
    return {"message": "Successfully logged out"}
