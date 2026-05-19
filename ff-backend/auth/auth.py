from fastapi import (

    Header,
    HTTPException

)

from auth.jwt_handler import decode_token

# VERIFY USER
def verify_user(

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

        return payload

    except:

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