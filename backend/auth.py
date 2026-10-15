import os
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Depends, Body
from fastapi.security import OAuth2PasswordBearer

try:
    from .notifier import notifier
except ImportError:
    from notifier import notifier

router = APIRouter()

# Simple in‑memory store for OTPs: {email: (otp, expires_at)}
_otp_store: Dict[str, tuple[str, datetime]] = {}

# OAuth2 placeholder – in a real system this would verify JWTs
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def _generate_otp(length: int = 6) -> str:
    """Generate a numeric OTP of the given length."""
    return "".join(random.choices(string.digits, k=length))

@router.post("/request-otp")
async def request_otp(email: str = Body(..., embed=True)) -> Dict[str, Any]:
    """Generate an OTP for the supplied email and send it via the existing email notifier.

    The OTP is valid for 5 minutes.
    """
    otp = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    _otp_store[email] = (otp, expires_at)

    # Send dedicated OTP verification email
    res = notifier.send_otp_email(email, otp)
    return {
        "success": res.get("success", True),
        "detail": res.get("message", "OTP sent to email"),
        "mode": res.get("mode", "simulated_local"),
        "dev_otp": otp if res.get("mode") != "live_smtp" else None,
        "email": email,
    }

@router.post("/verify-otp")
async def verify_otp(email: str = Body(..., embed=True), otp: str = Body(..., embed=True)) -> Dict[str, Any]:
    """Validate the supplied OTP.

    Returns a fake access token on success – in production replace with proper JWT handling.
    """
    stored = _otp_store.get(email)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this email")
    expected, expires_at = stored
    if datetime.now(timezone.utc) > expires_at:
        del _otp_store[email]
        raise HTTPException(status_code=400, detail="OTP expired")
    if otp != expected:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    # OTP verified – clean up and issue a dummy token
    del _otp_store[email]
    # In a real app you would issue a JWT here; we return a static placeholder.
    token = "dummy-access-token"
    return {"access_token": token, "token_type": "bearer"}

# Example protected endpoint
@router.get("/me")
async def me(token: str = Depends(oauth2_scheme)) -> Dict[str, str]:
    """Placeholder endpoint that requires a token.

    It simply echoes back the received token – replace with proper user lookup.
    """
    return {"message": "Authenticated", "token": token}
