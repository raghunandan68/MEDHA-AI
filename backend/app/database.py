import logging
from supabase import create_client, Client
from app.config import settings

logger = logging.getLogger(__name__)

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


def get_supabase_for_user(user_token: str) -> Client:
    if not settings.supabase_url:
        raise RuntimeError("Supabase URL not configured")
    anon_key = settings.supabase_anon_key
    if not anon_key:
        return get_supabase()
    client = create_client(settings.supabase_url, anon_key)
    try:
        client.auth.set_session(access_token=user_token, refresh_token="")
    except Exception as e:
        logger.warning(f"Failed to set session on user client: {e}")
    return client


def get_user_id(token: str) -> str | None:
    supabase = get_supabase()
    try:
        resp = supabase.auth.get_user(token)
        return resp.user.id if resp.user else None
    except Exception:
        return None
