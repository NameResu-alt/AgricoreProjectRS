import os
import jwt
import bcrypt
from datetime import timedelta, timezone, datetime
from typing import Any
from app.config import settings

SECRET_KEY = settings.secret_key
ALGORITHM = "HS256"
DEFAULT_EXPIRE_TIME_MINUTES = 30

def hash_password(unhashed_password: str) -> str:
    return bcrypt.hashpw(unhashed_password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed_password.encode("utf-8"))

def create_access_token(data: dict[str,str], expire_time: timedelta = None) -> str:
    copied_data = data.copy()

    expire = datetime.now(timezone.utc) + (expire_time or timedelta(minutes=DEFAULT_EXPIRE_TIME_MINUTES))

    copied_data["exp"] = expire
    return jwt.encode(payload=copied_data, key=SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(jwt=token, key=SECRET_KEY, algorithms=[ALGORITHM])