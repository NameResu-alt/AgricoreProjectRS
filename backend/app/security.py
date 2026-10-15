import os
import jwt
import secrets
import bcrypt
import hashlib
from datetime import timedelta, timezone, datetime
from typing import Any
from app.config import settings
from app.models import User, RefreshToken

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
DEFAULT_TOKEN_EXPIRE_TIME_MINUTES = settings.default_token_expire_time_minutes
DEFAULT_REFRESH_TOKEN_EXPIRE_TIME_MINUTES = settings.default_refresh_token_expire_time_minutes

def hash_password(unhashed_password: str) -> str:
    return bcrypt.hashpw(unhashed_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict[str,Any], expire_time: timedelta | None = None) -> str:
    copied_data = data.copy()

    expire = datetime.now(timezone.utc) + (expire_time or timedelta(minutes=DEFAULT_TOKEN_EXPIRE_TIME_MINUTES))

    copied_data["exp"] = expire
    return jwt.encode(payload=copied_data, key=SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user: User, expire_time: timedelta | None = None) -> tuple[RefreshToken, str]:

    expire = datetime.now(timezone.utc) + (expire_time or timedelta(minutes=DEFAULT_REFRESH_TOKEN_EXPIRE_TIME_MINUTES))

    raw_token = secrets.token_urlsafe(32)
    hashed_token = hash_refresh_token(raw_token)
    new_refresh_token = RefreshToken(expire_time=expire, user_id=user.id, hashed_token=hashed_token)

    return (new_refresh_token, raw_token)

def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(jwt=token, key=SECRET_KEY, algorithms=[ALGORITHM])