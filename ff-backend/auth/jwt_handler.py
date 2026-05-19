from jose import jwt, JWTError

from datetime import (
    datetime,
    timedelta,
    timezone
)

SECRET_KEY = "MYSECRETKEY"

ALGORITHM = "HS256"

# CREATE TOKEN
def create_token(data: dict):

    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(days=7)

    to_encode.update({

        "exp": expire

    })

    return jwt.encode(

        to_encode,

        SECRET_KEY,

        algorithm=ALGORITHM

    )

# DECODE TOKEN
def decode_token(token: str):

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]

        )

        return payload

    except JWTError:

        return None