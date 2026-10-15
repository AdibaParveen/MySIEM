import os
import random
import string
import base64
import json
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from typing import Dict, Any

from fastapi import APIRouter, HTTPException, Body, Depends
from fastapi.security import OAuth2PasswordBearer

try:
    from dotenv import load_dotenv
    load_dotenv(override=True)
except Exception:
    pass

router = APIRouter()

# Simple in-memory store for OTPs: {phone: (otp, expires_at)}
_otp_store_sms: Dict[str, tuple[str, datetime]] = {}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

def _generate_otp(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def send_sms_gateway(to_number: str, message: str) -> Dict[str, Any]:
    """
    Sends an SMS message via Twilio, Fast2SMS, or Simulated Local Engine.
    Configured via environment variables in backend/.env:
      - Twilio: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER
      - Fast2SMS: FAST2SMS_API_KEY
    """
    try:
        from dotenv import load_dotenv
        load_dotenv(override=True)
    except Exception:
        pass

    twilio_sid = os.getenv("TWILIO_ACCOUNT_SID", "").strip()
    twilio_token = os.getenv("TWILIO_AUTH_TOKEN", "").strip()
    twilio_from = os.getenv("TWILIO_FROM_NUMBER", "").strip()
    fast2sms_key = os.getenv("FAST2SMS_API_KEY", "").strip()

    # 1. Twilio Gateway Delivery
    if twilio_sid and twilio_token and twilio_from:
        try:
            url = f"https://api.twilio.com/2010-04-01/Accounts/{twilio_sid}/Messages.json"
            data = urllib.parse.urlencode({
                "To": to_number,
                "From": twilio_from,
                "Body": message,
            }).encode("utf-8")

            auth_str = f"{twilio_sid}:{twilio_token}"
            auth_b64 = base64.b64encode(auth_str.encode("utf-8")).decode("utf-8")

            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Authorization", f"Basic {auth_b64}")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")

            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                print(f"[LIVE SMS DELIVERED] Twilio sent SMS to {to_number}. SID: {resp_data.get('sid')}")
                return {
                    "success": True,
                    "mode": "live_twilio",
                    "message": f"Live SMS dispatched to {to_number} via Twilio Carrier Gateway",
                    "sid": resp_data.get("sid"),
                    "phone": to_number
                }
        except Exception as e:
            print(f"[LIVE SMS FAILED] Twilio error: {e}")
            return {
                "success": False,
                "mode": "error",
                "message": f"Twilio SMS Error: {str(e)}",
                "phone": to_number
            }

    # 2. Fast2SMS Gateway Delivery (Quick API in India)
    elif fast2sms_key:
        try:
            url = "https://www.fast2sms.com/dev/bulkV2"
            clean_number = "".join(c for c in to_number if c.isdigit())
            if len(clean_number) > 10:
                clean_number = clean_number[-10:]
            data = urllib.parse.urlencode({
                "authorization": fast2sms_key,
                "route": "q",
                "message": message,
                "language": "english",
                "flash": "0",
                "numbers": clean_number
            }).encode("utf-8")

            req = urllib.request.Request(url, data=data, method="POST")
            req.add_header("Content-Type", "application/x-www-form-urlencoded")
            with urllib.request.urlopen(req, timeout=10) as resp:
                resp_data = json.loads(resp.read().decode("utf-8"))
                is_success = resp_data.get("return", False)
                print(f"[FAST2SMS STATUS] {resp_data}")
                return {
                    "success": is_success,
                    "mode": "live_fast2sms",
                    "message": f"Live SMS dispatched to {to_number} via Fast2SMS",
                    "phone": to_number,
                    "detail": resp_data.get("message", [""])[0] if isinstance(resp_data.get("message"), list) else str(resp_data.get("message"))
                }
        except Exception as e:
            print(f"[FAST2SMS FAILED] Error: {e}")
            return {
                "success": False,
                "mode": "error",
                "message": f"Fast2SMS Gateway Error: {str(e)}",
                "phone": to_number
            }

    # 3. Simulated Local Dispatch
    print(f"\n==========================================")
    print(f"[SIMULATED SMS DISPATCH]")
    print(f"TO:      {to_number}")
    print(f"MESSAGE: {message}")
    print(f"INFO:    Add TWILIO_ACCOUNT_SID or FAST2SMS_API_KEY in backend/.env for real cellular delivery.")
    print(f"==========================================\n")
    return {
        "success": True,
        "mode": "simulated_sms",
        "message": f"Simulated SMS generated for {to_number} (Configure TWILIO or FAST2SMS in backend/.env for real delivery)",
        "phone": to_number,
        "preview": message,
    }

@router.post("/request-sms-otp")
async def request_sms_otp(phone: str = Body(..., embed=True)) -> Dict[str, Any]:
    """Generate an OTP for the supplied phone number and send via SMS."""
    otp = _generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    _otp_store_sms[phone] = (otp, expires_at)

    message = f"Your MySIEM SOC verification code is {otp}. It expires in 5 minutes."
    res = send_sms_gateway(phone, message)
    return {
        "success": res.get("success", True),
        "detail": res.get("message", "OTP sent via SMS"),
        "mode": res.get("mode"),
        "dev_otp": otp if res.get("mode") == "simulated_sms" else None,
        "phone": phone
    }

@router.post("/verify-sms-otp")
async def verify_sms_otp(phone: str = Body(..., embed=True), otp: str = Body(..., embed=True)) -> Dict[str, Any]:
    """Validate the supplied OTP for a phone number."""
    stored = _otp_store_sms.get(phone)
    if not stored:
        raise HTTPException(status_code=400, detail="No OTP requested for this phone number")
    expected, expires_at = stored
    if datetime.now(timezone.utc) > expires_at:
        del _otp_store_sms[phone]
        raise HTTPException(status_code=400, detail="OTP expired")
    if otp != expected:
        raise HTTPException(status_code=401, detail="Invalid OTP")
    del _otp_store_sms[phone]
    token = "dummy-access-token"
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me")
async def me(token: str = Depends(oauth2_scheme)) -> Dict[str, str]:
    return {"message": "Authenticated via SMS OTP", "token": token}
