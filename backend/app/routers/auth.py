import httpx

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.config import settings
from app.database import get_supabase, get_user_id
from app.models.auth import SignUpIn, SignInIn, AuthOut, AuthError, ChangePasswordIn, UpdateProfileIn, MessageOut

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()


@router.post("/signup", response_model=AuthOut | AuthError)
async def signup(body: SignUpIn):
    supabase = get_supabase()
    resp = supabase.auth.sign_up({
        "email": body.email,
        "password": body.password,
        "options": {"data": {"name": body.name}},
    })
    if resp.user:
        return AuthOut(
            user_id=resp.user.id,
            email=resp.user.email or body.email,
            name=body.name,
            access_token=resp.session.access_token if resp.session else "",
        )
    raise HTTPException(status_code=400, detail="Signup failed")


@router.post("/signin", response_model=AuthOut | AuthError)
async def signin(body: SignInIn):
    supabase = get_supabase()

    resp = supabase.auth.sign_in_with_password(
        {"email": body.email, "password": body.password}
    )

    if resp.user and resp.session:
        name = resp.user.user_metadata.get("name", "")
        return AuthOut(
            user_id=resp.user.id,
            email=resp.user.email or body.email,
            name=name,
            access_token=resp.session.access_token,
        )

    user_exists = await _user_exists_by_email(body.email)
    if not user_exists:
        raise HTTPException(
            status_code=401,
            detail="You are not registered. Please create an account.",
        )
    raise HTTPException(
        status_code=401,
        detail="Invalid email or password.",
    )


async def _user_exists_by_email(email: str) -> bool:
    if not settings.supabase_service_key:
        return False

    headers = {
        "apikey": settings.supabase_service_key,
        "Authorization": f"Bearer {settings.supabase_service_key}",
    }
    params = {"email": email}

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                f"{settings.supabase_url}/auth/v1/admin/users",
                headers=headers,
                params=params,
            )

        if resp.status_code != 200:
            return False

        data = resp.json()
        users = data.get("users", [])
        return len(users) > 0
    except Exception:
        return False


@router.post("/change-password", response_model=MessageOut)
async def change_password(
    body: ChangePasswordIn,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    supabase = get_supabase()

    try:
        user = supabase.auth.get_user(credentials.credentials)
        if not user or not user.user:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

    user_id = user.user.id
    email = user.user.email
    if not email:
        raise HTTPException(status_code=400, detail="Cannot verify password: no email on account")

    async with httpx.AsyncClient() as client:
        verify = await client.post(
            f"{settings.supabase_url}/auth/v1/token?grant_type=password",
            json={"email": email, "password": body.current_password},
            headers={"apikey": settings.supabase_service_key},
        )
        if verify.status_code != 200:
            raise HTTPException(status_code=401, detail="Current password is incorrect")

    try:
        supabase.auth.admin.update_user_by_id(user_id, {"password": body.new_password})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update password: {e}")

    return MessageOut(message="Password changed successfully")


@router.delete("/account", response_model=MessageOut)
async def delete_account(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    supabase = get_supabase()
    user_id = get_user_id(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    if not settings.supabase_service_key:
        raise HTTPException(status_code=500, detail="Server configuration error")

    headers = {
        "apikey": settings.supabase_service_key,
        "Authorization": f"Bearer {settings.supabase_service_key}",
    }
    async with httpx.AsyncClient() as client:
        resp = await client.delete(
            f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
            headers=headers,
        )

    if resp.status_code == 404:
        raise HTTPException(status_code=404, detail="User not found")
    if resp.status_code >= 400:
        raise HTTPException(
            status_code=500,
            detail=f"Account deletion failed: {resp.text}",
        )

    return MessageOut(message="Account deleted successfully")


@router.put("/profile", response_model=MessageOut)
async def update_profile(
    body: UpdateProfileIn,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    supabase = get_supabase()
    user_id = get_user_id(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    update_data = {}
    if body.name is not None:
        update_data["user_metadata"] = {"name": body.name}

    if update_data:
        supabase.auth.admin.update_user_by_id(user_id, update_data)

    return MessageOut(message="Profile updated successfully")
