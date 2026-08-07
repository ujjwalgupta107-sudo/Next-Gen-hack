import time
from collections import defaultdict
from fastapi import Request, HTTPException, Security, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.auth_service import decode_access_token

security = HTTPBearer(auto_error=False)

# Sliding window in-memory Rate Limiter
class RateLimiter:
    def __init__(self, requests_per_minute: int = 120):
        self.requests_per_minute = requests_per_minute
        self.client_records = defaultdict(list)

    async def check_rate_limit(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        now = time.time()
        window_start = now - 60.0

        # Purge timestamps older than 1 minute
        self.client_records[client_ip] = [
            ts for ts in self.client_records[client_ip] if ts > window_start
        ]

        if len(self.client_records[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a moment before sending more requests."
            )

        self.client_records[client_ip].append(now)

rate_limiter = RateLimiter(requests_per_minute=120)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    """FastAPI dependency to extract and verify JWT user payload."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token"
        )

    token = credentials.credentials
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is expired or invalid"
        )
    return payload

class RequireRole:
    """FastAPI authorization middleware for RBAC."""
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: dict = Depends(get_current_user)):
        user_role = user.get("role", "creator")
        if user_role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of {self.allowed_roles} roles"
            )
        return user
