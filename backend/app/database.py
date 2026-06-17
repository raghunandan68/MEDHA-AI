from supabase import create_client, Client
from app.config import settings

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        if not settings.supabase_url or not settings.supabase_service_key:
            raise RuntimeError(
                "Supabase credentials not configured. "
                "Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env"
            )
        _supabase = create_client(settings.supabase_url, settings.supabase_service_key)
    return _supabase


def get_user_id(token: str) -> str | None:
    supabase = get_supabase()
    try:
        resp = supabase.auth.get_user(token)
        return resp.user.id if resp.user else None
    except Exception:
        return None
