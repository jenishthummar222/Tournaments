from fastapi import (

    Header,
    HTTPException

)

from database import db 

from auth.jwt_handler import decode_token

# VERIFY USER
def verify_user(authorization: str = Header(...)):

    try:
        token = authorization.split(" ")[1]
        payload = decode_token(token)

        if not payload:
            raise HTTPException(
                status_code=401,
                detail="Invalid Token"
            )

        user = db.users.find_one({
            "email": payload.get("email")
        })

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        if user.get("status") == "banned":
            raise HTTPException(
                status_code=403,
                detail="You are banned"
            )

        return payload

    except HTTPException as e:
        raise e   # 🔥 IMPORTANT FIX

    except Exception:
        raise HTTPException(
            status_code=401,
            detail="Authentication Failed"
        )
# VERIFY ADMIN
def verify_admin(

    authorization: str = Header(...)

):

    try:

        token = authorization.split(" ")[1]

        payload = decode_token(token)

        if not payload:

            raise HTTPException(

                status_code=401,

                detail="Invalid Token"

            )

        if not payload.get("is_admin"):

            raise HTTPException(

                status_code=403,

                detail="Admin Access Required"

            )

        return payload

    except:

        raise HTTPException(

            status_code=401,

            detail="Authentication Failed"

        )