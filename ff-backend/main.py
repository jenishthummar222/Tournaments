from fastapi import FastAPI,File, UploadFile, Form,Depends,Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import (
    FileResponse
)
from fastapi.staticfiles import StaticFiles
from fastapi.encoders import jsonable_encoder
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from dateutil.parser import isoparse
import easyocr
import cv2
import re
import numpy as np
from PIL import Image
from dateutil import parser

from auth.auth import (

    verify_user,
    verify_admin

)
from auth.jwt_handler import SECRET_KEY

from threading import Thread
import time
from database import db
from pymongo import MongoClient
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime,timedelta,timezone
from auth.hash import hash_password,verify_password
from auth.jwt_handler import create_token
from bson import ObjectId
import random
import smtplib
import os
import shutil
import pandas as pd
import uuid


reader = easyocr.Reader(['en'])

# Helper function for payment ss
def extract_payment_data(image_path):

    try:

        results = reader.readtext(image_path)

        full_text = " ".join(

            [text[1] for text in results]

        )

        full_text = full_text.replace("\n", " ")

        print("OCR TEXT:", full_text)

        
        # =========================
        # TRANSACTION ID
        # =========================

        transaction_id = None

        possible_ids = re.findall(

            r'\b[A-Z0-9]{10,20}\b',

            full_text

        )

        filtered_ids = []

        for item in possible_ids:

            # REMOVE BAD MATCHES
            if item.lower() in [

                "transaction",
                "completed",
                "googlepay",
                "payment",
                "success"

            ]:

                continue

            # ONLY VALID LENGTH
            if len(item) >= 10:

                filtered_ids.append(item)

        # TAKE FIRST VALID
        if filtered_ids:

            transaction_id = filtered_ids[0]


        # =========================
        # AMOUNT
        # =========================

        amount = None

        amount_patterns = [

            r'₹\s*([0-9]+(?:\.[0-9]{1,2})?)',

            r'Rs\.?\s*([0-9]+(?:\.[0-9]{1,2})?)',

            r'INR\s*([0-9]+(?:\.[0-9]{1,2})?)',

            r'Amount\s*Paid\s*₹?\s*([0-9]+(?:\.[0-9]{1,2})?)',

            r'Paid\s*:?\s*₹?\s*([0-9]+(?:\.[0-9]{1,2})?)'

        ]

        for pattern in amount_patterns:

            match = re.search(

                pattern,

                full_text,

                re.IGNORECASE

            )

            if match:

                amount = int(

                    float(match.group(1))

                )

                break



        # =========================
        # DATE
        # =========================

        payment_date = None

        date_match = re.search(

            r'([0-9]{1,2}\s+[A-Za-z]+\s+[0-9]{4})',

            full_text

        )

        if date_match:

            payment_date = date_match.group(1)

        return {

            "transaction_id":
            transaction_id,

            "amount":
            amount,

            "date":
            payment_date,

            "raw_text":
            full_text

        }
        

    except Exception as e:

        return {

            "error":
            str(e)

        }

# STATUS AUTO UPDATE
def auto_update_tournaments():

    while True:

        tournaments = list(
            db.tournaments.find({})
        )

        now = datetime.now(timezone.utc)

        for tournament in tournaments:

            try:

                # SKIP CANCELLED
                if tournament.get("status") == "cancelled":

                    continue

                match_time = tournament.get(
                    "match_time"
                )
                if not match_time:

                    continue

                 # ✅ FIX: ensure datetime object
                if isinstance(match_time, str):
                    start_time = parser.isoparse(match_time)
                else:
                    start_time = match_time

                ## ALWAYS convert to UTC properly
                start_time = start_time.astimezone(timezone.utc)

                diff = (
                    now - start_time
                ).total_seconds() / 60

                # DEFAULT
                status = "upcoming"

                # RESULT UPLOADED
                if tournament.get("result_uploaded",False):

                    status = "completed"

                # LIVE
                elif -5 <= diff :
                    status = "live"

                # UPCOMING
                elif diff < -5:

                    status = "upcoming"
                

                db.tournaments.update_one(

                    {
                        "_id":
                        tournament["_id"]
                    },

                    {
                        "$set": {

                            "status":
                            status

                        }
                    }

                )

            except Exception as e:

                print(
                    "AUTO UPDATE ERROR:",
                    e
                )

        time.sleep(30)

BASE_DIR = os.path.dirname(
    os.path.abspath(__file__)
)
UPLOAD_DIR = os.path.join(
    BASE_DIR,
    "uploads"
)

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app = FastAPI()

# ==============================
# STATIC FOLDERS
# ==============================

os.makedirs(
    "exports",
    exist_ok=True
)

os.makedirs(
    "results",
    exist_ok=True
)

app.mount(
    "/exports",
    StaticFiles(directory="exports"),
    name="exports"
)

app.mount(
    "/results",
    StaticFiles(directory="results"),
    name="results"
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)

app.mount(
    "/payment_screenshots",
    StaticFiles(directory="payment_screenshots"),
    name="payment_screenshots"
)

app.add_middleware(

    CORSMiddleware,

    allow_origins=[

        "http://localhost:5173"

    ],

    allow_credentials=True,

    allow_methods=[

        "GET",

        "POST",

        "PUT",

        "DELETE"

    ],

    allow_headers=["*"],

)


security = HTTPBearer()

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):

    token = credentials.credentials

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=["HS256"]

        )

        # CHECK ADMIN
        if not payload.get("is_admin"):

            raise HTTPException(

                status_code=403,

                detail="Admin access required"

            )

        return payload

    except JWTError:

        raise HTTPException(

            status_code=401,

            detail="Invalid token"

        )

#Update Profile Pic
# Upload Profile Pic
@app.post("/upload-profile")
async def upload_profile(

    email: str = Form(...),

    profile_pic: UploadFile = File(...)

):

    os.makedirs(

        "uploads/profile_pics",

        exist_ok=True

    )

    # UNIQUE FILE NAME
    unique_filename = (

        f"{uuid.uuid4()}_{profile_pic.filename}"

    )

    file_path = (

        f"uploads/profile_pics/{unique_filename}"

    )

    # SAVE FILE
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(

            profile_pic.file,

            buffer

        )

    # SAVE DB
    db.users.update_one(

        {
            "email": email
        },

        {
            "$set": {

                "profile_pic":
                f"/{file_path}"

            }
        }

    )

    return {

        "message":
        "Profile Updated",

        "profile_pic":
        f"/{file_path}"

    }

# Update User Name
# Update Name
@app.post("/update-name")
async def update_name(data: dict):

    email = data.get("email")

    name = data.get("name")

    db.users.update_one(

        {
            "email": email
        },

        {
            "$set": {

                "name": name

            }
        }

    )

    return {

        "message":
        "Name Updated"

    }

# ==============================
# EXPORT PLAYERS EXCEL
# ==============================

@app.get("/export-players/{tournament_id}")
def export_players(
    tournament_id: str,
    admin = Depends(verify_admin)
):

    players = list(

        db.joined.find({

            "tournament_id":
            tournament_id

        })

    )
    if not players:

        return {

            "error":
            "No Players Found"

        }
    
    # TOURNAMENT
    tournament = db.tournaments.find_one({

        "_id":
        ObjectId(tournament_id)

    })

    prize_pool = tournament.get(
        "prize",
        0
    )

    excel_data = []
    try:
        for player in players:

            excel_data.append({

            "Game Name":
            player.get(
                "ingame_name",
                ""
            ),

            "Email":
            player.get(
                "email",
                ""
            ),

            "BOOYAH":0,           

            "Position": 0,

            "Kills": 0,

            "Total":0,

            "Win/Loss": 0,

            "Prize Pool": prize_pool
        })
            
    except:
        print("error in excel data")
    
    try:
    
        print(players)
        print(len(players))

        df = pd.DataFrame(
        excel_data
        )

        os.makedirs(
            "exports",
            exist_ok=True
        )
        filename = (
            f"exports/{tournament_id}.xlsx"
        )

        df.to_excel(

            filename,

            index=False,

            engine="openpyxl"

        )
        return FileResponse(

            path=filename,

            filename=
            f"{tournament_id}.xlsx",

            media_type=
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

        )
    except Exception as e :
        print("Error in excel file saveing",e)

# ==============================
# SAFE INTEGER
# ==============================

def safe_int(value):

    try:

        if pd.isna(value):

            return 0

        return int(value)

    except:

        return 0


# ==============================
# UPLOAD EXCEL RESULT
# ==============================

@app.post("/upload-excel-result/{tournament_id}")
async def upload_excel_result(

    tournament_id: str,

    excel_file: UploadFile = File(...),

    admin = Depends(verify_admin)

):

    try:

        # =========================
        # TOURNAMENT
        # =========================

        tournament = db.tournaments.find_one({

            "_id": ObjectId(tournament_id)

        })

        if not tournament:

            return {

                "error":
                "Tournament not found"

            }

        # =========================
        # FILE VALIDATION
        # =========================

        allowed = ["xlsx", "xls"]

        ext = (

            excel_file.filename
            .split(".")[-1]
            .lower()

        )

        if ext not in allowed:

            return {

                "error":
                "Invalid Excel File"

            }

        # =========================
        # REVERSE OLD DATA
        # =========================

        old_matches = list(

            db.match_history.find({

                "tournament_id":
                tournament_id

            })

        )

        for old in old_matches:

            old_amount = safe_int(

                old.get(
                    "win_amount",
                    0
                )

            )

            # REMOVE WALLET
            if old_amount > 0:

                db.users.update_one(

                    {
                        "email":
                        old["email"]
                    },

                    {
                        "$inc": {

                            "wallet":
                            -old_amount

                        }
                    }

                )

            # REMOVE WIN
            if old.get("result") == "WON":

                db.users.update_one(

                    {
                        "email":
                        old["email"]
                    },

                    {
                        "$inc": {

                            "wins":
                            -1

                        }
                    }

                )

        # =========================
        # DELETE OLD RECORDS
        # =========================

        db.match_history.delete_many({

            "tournament_id":
            tournament_id

        })

        db.transactions.delete_many({

            "tournament_id":
            tournament_id

        })

        # =========================
        # CREATE RESULTS FOLDER
        # =========================

        os.makedirs(

            "results",

            exist_ok=True

        )

        # =========================
        # SAVE TEMP EXCEL
        # =========================

        filename = (

            f"temp_{uuid.uuid4()}.{ext}"

        )

        path = f"results/{filename}"

        with open(path, "wb") as buffer:

            shutil.copyfileobj(

                excel_file.file,

                buffer

            )

        # =========================
        # READ EXCEL
        # =========================

        try:

            df = pd.read_excel(path)

        finally:

            if os.path.exists(path):

                os.remove(path)

        # =========================
        # PROCESS PLAYERS
        # =========================

        for _, row in df.iterrows():

            email = str(

                row.get(
                    "Email",
                    ""
                )

            ).strip()

            # SKIP EMPTY EMAIL
            if not email:

                continue

            # CHECK USER
            user = db.users.find_one({

                "email": email

            })

            if not user:

                continue

            game_name = str(

                row.get(
                    "Game Name",
                    ""
                )

            ).strip()

            booyah = safe_int(

                row.get(
                    "BOOYAH",
                    0
                )

            )

            position = safe_int(

                row.get(
                    "Position",
                    0
                )

            )

            kills = safe_int(

                row.get(
                    "Kills",
                    0
                )

            )

            total = safe_int(

                row.get(
                    "Total",
                    0
                )

            )

            win_amount = safe_int(

                row.get(
                    "Win/Loss",
                    0
                )

            )

            # =========================
            # RESULT
            # =========================

            result = (

                "WON"

                if win_amount > 0

                else "LOSS"

            )

            # =========================
            # UPDATE WALLET
            # =========================

            if win_amount > 0:

                db.users.update_one(

                    {
                        "email":
                        email
                    },

                    {
                        "$inc": {

                            "wallet":
                            win_amount

                        }
                    }

                )
            
            # DEDUCT PRIZE FROM ADMIN WALLET
            db.admin_wallet.update_one(

                {},

                {

                    "$inc": {

                        "total_balance": -int(win_amount),

                        "total_prize_paid": int(win_amount),

                        "profit": -int(win_amount)

                    },

                    "$set": {

                        "updated_at":
                        datetime.now(timezone.utc)

                    }

                }

            )

            # =========================
            # UPDATE WINS
            # =========================

            if result == "WON":

                db.users.update_one(

                    {
                        "email":
                        email
                    },

                    {
                        "$inc": {

                            "wins":
                            1

                        }
                    }

                )

            # =========================
            # MATCH HISTORY
            # =========================

            db.match_history.insert_one({

                "tournament_id":
                tournament_id,

                "tournament_title":
                tournament.get(
                    "title",
                    ""
                ),

                "email":
                email,

                "game_name":
                game_name,

                "position":
                position,

                "kills":
                kills,

                "booyah":
                booyah,

                "total_points":
                total,

                "result":
                result,

                "win_amount":
                win_amount,

                "created_at":
                datetime.now(timezone.utc),

                "expireAt":

                datetime.now(timezone.utc)

                + timedelta(days=7)

            })

            # =========================
            # TRANSACTION
            # =========================

            if win_amount > 0:

                db.transactions.insert_one({

                    "tournament_id":
                    tournament_id,

                    "email":
                    email,

                    "type":
                    "WINNING",

                    "amount":
                    win_amount,

                    "status":
                    "SUCCESS",

                    "message":

                        f"Won ₹{win_amount} "
                        f"in {tournament.get('title')}",

                    "created_at":
                    datetime.now(timezone.utc),

                    "expireAt":

                    datetime.now(timezone.utc)

                    + timedelta(days=30)

                })
            else:

                db.transactions.insert_one({

                    "tournament_id": tournament_id,
                    "email": email,
                    "type": "LOSS",
                    "amount": 0,
                    "status": "FAILED",
                    "message": f"Lost match in {tournament.get('title')}",
                    "created_at": datetime.now(timezone.utc),
                    "expireAt": datetime.now(timezone.utc) + timedelta(days=30)

                })

        # =========================
        # UPDATE TOURNAMENT
        # =========================

        db.tournaments.update_one(

            {
                "_id":
                ObjectId(tournament_id)
            },

            {
                "$set": {

                    "status":
                    "completed",

                    "result_uploaded":
                    True

                }

            }

        )

        return {

            "message":
            "Excel Result Uploaded Successfully"

        }

    except Exception as e:

        return {

            "error":
            str(e)

        }

# ==============================
# UPLOAD RESULT IMAGE
# ==============================

@app.post("/upload-result-image/{tournament_id}")

async def upload_result_image(

    tournament_id: str,

    result_image: UploadFile = File(...),

    admin = Depends(verify_admin)

):

    try:

        tournament = db.tournaments.find_one({

            "_id":
            ObjectId(tournament_id)

        })

        if not tournament:

            return {

                "error":
                "Tournament not found"

            }

        os.makedirs(
            "results",
            exist_ok=True
        )

        # DELETE OLD IMAGE
        old_image = tournament.get(

            "result_image"

        )

        if old_image:

            old_path = old_image.replace("/", "\\")

            if os.path.exists(old_path):

                os.remove(old_path)

        # SAVE NEW IMAGE
        ext = (
            result_image.filename
            .split(".")[-1]
        )

        filename = (
            f"{tournament_id}.{ext}"
        )

        path = f"results/{filename}"

        with open(path, "wb") as buffer:

            shutil.copyfileobj(

                result_image.file,
                buffer

            )

        db.tournaments.update_one(

            {
                "_id":
                ObjectId(tournament_id)
            },

            {
                "$set": {

                    "result_image":
                    f"/results/{filename}"

                }

            }

        )

        return {

            "message":
            "Result Image Uploaded"

        }

    except Exception as e:

        return {

            "error":
            str(e)

        }

# ==============================
# GET RESULT
# ==============================

@app.get("/result/{tournament_id}")
def get_result(
    tournament_id: str
):

    tournament = db.tournaments.find_one({

        "_id":
        ObjectId(
            tournament_id
        )

    })
    if not tournament:

        return {

            "error":
            "Tournament Not Found"

        }

    return {

        "title":
        tournament.get(
            "title"
        ),

        "result_image":
        tournament.get(
            "result_image",
            ""
        )

    }

# ==============================
# MATCH HISTORY
# ==============================

@app.get("/match-history/{email}")
def get_match_history(email: str):

    history = list(

        db.match_history.find(

            {
                "email": email
            },

            {
                "_id": 0
            }

        )

        .sort("created_at", -1)

        .limit(3)

    )

    return history


# Send OTP Email
def send_otp(email, otp):

    sender = "jenish.thummar82@gmail.com"

    password = "abbo zoma bthk dfcs"

    msg = MIMEMultipart("alternative")

    msg["Subject"] = (
        "🔥 FF Arena - Secure Verification Code"
    )

    html = f"""
        <html>
        <body style="background-color:#0f0f0f;color:white;font-family:Arial;">
            
            <div style="max-width:500px;margin:auto;padding:20px;background:#1c1c1c;border-radius:10px;border:1px solid #333;">
            
            <h2 style="color:#ffcc00;text-align:center;">
                🎮 FF ARENA SECURITY SYSTEM
            </h2>

            <p style="font-size:16px;">
                Hello Player 👋
            </p>

            <p>
                You requested a login/verification code for your FF Arena account.
            </p>

            <div style="text-align:center;margin:20px 0;">
                <h1 style="background:#ffcc00;color:#000;padding:10px;border-radius:8px;display:inline-block;">
                {otp}
                </h1>
            </div>

            <p style="color:#ff6666;">
                ⚠️ Do not share this code with anyone.
            </p>

            <hr style="border:0;border-top:1px solid #333;">

            <p style="font-size:12px;color:#aaa;text-align:center;">
                © FF Arena Gaming Platform<br>
                Secure Login System
            </p>

            </div>

        </body>
        </html>
        """
    msg.attach(MIMEText(html, "html"))

    msg["From"] = sender

    msg["To"] = email

    server = smtplib.SMTP(
        "smtp.gmail.com",
        587
    )

    server.starttls()

    server.login(
        sender,
        password
    )

    server.send_message(msg)

    server.quit()

# STEP 1
# SEND OTP
@app.post("/send-otp")
async def send_register_otp(

    name: str = Form(...),

    mobile: str = Form(...),

    email: str = Form(...),

    password: str = Form(...),

    profile_pic: UploadFile = File(...)

):

    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:

        return {
            "error":
            "Email already exists"
        }

    # IMAGE EXTENSION
    extension = os.path.splitext(
        profile_pic.filename
    )[1]

    # FILE NAME
    filename = f"{email}{extension}"

    # FILE PATH
    file_path = os.path.join(
        UPLOAD_DIR,
        filename
    )

    # SAVE IMAGE
    with open(file_path, "wb") as buffer:

        shutil.copyfileobj(
            profile_pic.file,
            buffer
        )
    
    # IMAGE URL
    profile_url = f"/uploads/{filename}"

    otp = str(

        random.randint(
            100000,
            999999
        )

    )

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=5)
    )

    # Remove old OTP
    db.otps.delete_many({
        "email": email
    })

    # Save OTP
    db.otps.insert_one({

        "name": name,

        "mobile": mobile,

        "email": email,

        "password": hash_password(password),

        "profile_pic": profile_url,

        "otp": otp,

        "expire": expire

    })

    send_otp(
        email,
        otp
    )

    return {
        "message":
        "OTP Sent Successfully"
    }

@app.post("/send-forgot-otp")
def send_forgot_otp(data: dict):

    user = db.users.find_one({
        "email": data["email"]
    })

    if not user:

        return {
            "error": "User not found"
        }

    otp = str(random.randint(100000, 999999))

    expire = datetime.now(timezone.utc)+ timedelta(minutes=5)

    db.otps.delete_many({
        "email": data["email"]
    })

    db.otps.insert_one({

        "email": data["email"],

        "otp": otp,

        "expire": expire

    })

    send_otp(data["email"], otp)

    return {
        "message": "OTP Sent"
    }

@app.post("/reset-password")
def reset_password(data: dict):

    saved = db.otps.find_one({
        "email": data["email"]
    })

    if not saved:

        return {
            "error": "OTP not found"
        }

    now = datetime.now(timezone.utc)
    expire = saved["expire"]

    # SAFE conversion (fix naive vs aware issue)
    if expire.tzinfo is None:
        expire = expire.replace(tzinfo=timezone.utc)
    
    print("now",now)
    print("exp",expire)

    if now > expire:
        db.otps.delete_many({"email": data["email"]})
        return {"error": "OTP Expired"}


    if saved["otp"] != data["otp"]:

        return {
            "error": "Wrong OTP"
        }

    hashed = hash_password(
        data["password"]
    )

    db.users.update_one(
        {
            "email": data["email"]
        },
        {
            "$set": {
                "password": hashed
            }
        }
    )

    db.otps.delete_many({
        "email": data["email"]
    })

    return {
        "message": "Password Reset Successful"
    }


# Home pages ******************************************
@app.get("/")
def home():
    return {"message": "Backend Running"}

@app.post("/login")
def login(user: dict):

    existing_user = db.users.find_one({

        "email": user["email"]

    })

    if not existing_user:
        return {"error": "User not found"}

    valid_password = verify_password(
        user["password"],
        existing_user["password"]
    )

    if not valid_password:
        return {"error": "Incorrect password"}
    
    # ========================= # BAN CHECK # ========================= 
    if existing_user.get("status") == "banned": return { "error": "Your account is banned" }

    token = create_token({

        "email":
        existing_user["email"],

        "is_admin":
        existing_user.get(
            "is_admin",
            False
        )

    })

    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "name": existing_user["name"],
            "email": existing_user["email"],
            "wallet": existing_user["wallet"],
            "matches": existing_user.get("matches", 0),
            "wins": existing_user.get("wins", 0),
            "profile_pic": existing_user.get("profile_pic"),
            "is_admin":existing_user.get("is_admin",False)
        }
    }

# STEP 2
# VERIFY OTP + REGISTER
@app.post("/register")
def register(data: dict):

    saved = db.otps.find_one({

        "email": data["email"]

    })

    if not saved:

        return {
            "error":
            "OTP not found"
        }

    now = datetime.now(timezone.utc)
    expire = saved["expire"]

    # SAFE conversion (fix naive vs aware issue)
    if expire.tzinfo is None:
        expire = expire.replace(tzinfo=timezone.utc)
    
    print("now",now)
    print("exp",expire)

    if now > expire:
        db.otps.delete_many({"email": data["email"]})
        return {"error": "OTP Expired"}

    # OTP Check
    if saved["otp"] != data["otp"]:

        return {
            "error":
            "Wrong OTP"
        }
     # Create User
    new_user = {

        "name": saved["name"],

        "mobile": saved["mobile"],

        "email": saved["email"],

        "password":saved["password"],

        "profile_pic":
        saved["profile_pic"],

        "wallet": 0,

        "matches": 0,

        "wins": 0,

        "is_admin": False,

        "created_at":
        datetime.now(timezone.utc)

    }

    db.users.insert_one(
        new_user
    )

     # Delete OTP
    db.otps.delete_many({

        "email":
        data["email"]

    })

    # Create Token
    token = create_token({

        "email":
        saved["email"]

    })
    return {

        "token": token,

        "user": {

            "name":
            new_user["name"],

            "email":
            new_user["email"],

            "mobile":
            new_user["mobile"],

            "wallet":
            new_user["wallet"],

            "profile_pic":
            new_user["profile_pic"]

        }

    }


@app.get("/tournaments")
def get_tournaments():

    tournaments = list(
        db.tournaments.find({}).sort("match_time", -1)
    )

    data = []

    for tournament in tournaments:

        tournament_id = str(
            tournament["_id"]
        )

        joined_players = list(

            db.joined.find({

                "tournament_id":
                tournament_id

            })

        )
        match_time = tournament.get("match_time")

        if match_time.tzinfo is None:
            match_time = match_time.replace(tzinfo=timezone.utc)
        match_time = match_time.isoformat()
        
        print(match_time)

        joined_players_list = []

        for index, player in enumerate(joined_players):

            joined_players_list.append({

                "slot": index + 1,

                "name":
                player.get(
                    "ingame_name",
                    "Unknown"
                )

            })

        data.append({

            "_id":
            tournament_id,

            "title":
            tournament.get("title"),

            "game_mode":
            tournament.get("game_mode"),

            "entry_fee":
            tournament.get("entry_fee", 0),

            "prize":
            tournament.get("prize", 0),

            "players":
            tournament.get("players", 0),

            "joined_players":
            tournament.get("joined_players", 0),

            "match_time":
            tournament.get("match_time"),

            "rules":
            tournament.get("rules", []),

            "status":
            tournament.get("status", "upcoming"),

            "room_id":
            tournament.get("room_id", ""),

            "room_password":
            tournament.get("room_password", ""),

            "result_image":
            tournament.get("result_image", ""),

            "joined_players_list":
            joined_players_list

        })

    return data

#player count Api
@app.get("/tournament/{tournament_id}")
def get_single_tournament(tournament_id: str):

    tournament = db.tournaments.find_one({
        "_id": ObjectId(tournament_id)
    })

    if not tournament:

        return {
            "error": "Tournament not found"
        }

    tournament["_id"] = str(
        tournament["_id"]
    )

    joined_players = list(
        db.joined.find({
            "tournament_id": tournament_id
        })
    )

    joined_players_list = []

    for index, player in enumerate(joined_players):

        joined_players_list.append({

            "slot": index + 1,

            "name": player.get(
                "ingame_name",
                "Unknown"
            )

        })

    tournament["joined_players_list"] = joined_players_list

    tournament["joined_players"] = len(
        joined_players
    )

    return tournament

@app.post("/add-tournament")
def add_tournament(

    data: dict,

    admin = Depends(verify_admin)

):

    # =========================
    # CONVERT TIME STRING
    # TO REAL DATETIME
    # =========================

    raw_time = data.get("match_time")

    match_time = parser.parse(raw_time)

    # force UTC
    if match_time.tzinfo is None:
        match_time = match_time.replace(tzinfo=timezone.utc)
    else:
        match_time = match_time.astimezone(timezone.utc)

    tournament = {

        "title":
        data.get("title"),

        "game_mode":
        data.get("game_mode"),

        "entry_fee":
        data.get("entry_fee", 0),

        "prize":
        data.get("prize", 0),

        "players":
        data.get("players", 0),

        "joined_players":
        0,

        "rules":
        data.get("rules", []),

        # REAL DATETIME
        "match_time":
        match_time,

        "status":
        "upcoming",

        "room_id":
        "",

        "room_password":
        "",

        "created_at":
        datetime.now(timezone.utc)

    }

    db.tournaments.insert_one(

        tournament

    )
    
    return {

        "message":
        "Tournament Added Successfully"

    }

@app.post("/join-tournament")
def join_tournament(

    data: dict,

    user_auth = Depends(verify_user)

):

    try:

        email = data.get("email")
        tournament_id = data.get("tournament_id")
        ingame_name = data.get("ingame_name", "")

        # CHECK OBJECT ID
        try:

            tournament_object_id = ObjectId(
                tournament_id
            )

        except:

            return {
                "error":
                "Invalid Tournament ID"
            }

        # USER
        user = db.users.find_one({

            "email": email

        })

        if not user:

            return {

                "error":
                "User not found"

            }

        # TOURNAMENT
        tournament = db.tournaments.find_one({

            "_id":
            tournament_object_id

        })

        if not tournament:

            return {

                "error":
                "Tournament not found"

            }

        # SAFE VALUES
        wallet = int(
            user.get("wallet", 0)
        )

        entry_fee = int(
            tournament.get("entry_fee", 0)
        )

        joined_players = int(
            tournament.get("joined_players", 0)
        )

        players = int(
            tournament.get("players", 0)
        )

        
        # ALREADY JOINED
        already = db.joined.find_one({

            "email": email,

            "tournament_id":
            tournament_id

        })

        if already:

            return {

                "error":
                "Already joined"

            }

        # MATCH FULL
        if joined_players >= players:

            return {

                "error":
                "Match Full"

            }

        # SAFE WALLET DEDUCTION
        wallet_update = db.users.update_one(

            {

                "email": email,

                "wallet": {

                    "$gte": entry_fee

                }

            },

            {

                "$inc": {

                    "wallet": -entry_fee,

                    "matches": 1

                }

            }

        )

        # BALANCE FAILED
        if wallet_update.modified_count == 0:

            return {

                "error":
                "Insufficient Balance"

            }
        # UPDATE TOURNAMENT
        update_result =db.tournaments.update_one(

            {
                "_id":
                tournament_object_id,
                "joined_players": {

                    "$lt": players

                }
            },

            {
                "$inc": {

                    "joined_players": 1

                }

            }

        )
        if update_result.modified_count == 0:
             # REFUND MONEY
            db.users.update_one(

                {

                    "email": email

                },

                {

                    "$inc": {

                        "wallet": entry_fee

                    }

                }

            )
            return {

                "error":
                "Match Full"

            }
        # ADD ENTRY TO ADMIN WALLET
        db.admin_wallet.update_one(

            {},

            {

                "$inc": {

                    "total_balance": entry_fee,

                    "total_entry_collected": entry_fee,

                    "profit": entry_fee

                },

                "$set": {

                    "updated_at": datetime.now(timezone.utc)

                }

            }

        )

        # SAVE JOIN
        db.joined.insert_one({

            "email": email,

            "tournament_id":
            tournament_id,

            "ingame_name":
            ingame_name,

            "joined_at":
            datetime.now(timezone.utc)

        })

        db.transactions.insert_one({

            "tournament_id": tournament_id,
            "email": email,
            "type": "Join Match",
            "amount": entry_fee,
            "status": "SUCCESS",
            "message": f"{tournament.get('title')}",
            "created_at": datetime.now(timezone.utc),
            "expireAt": datetime.now(timezone.utc) + timedelta(days=30)

        })

        return {

            "message":
            "Tournament Joined"

        }

    except Exception as e:

        return {

            "error":
            str(e)

        }

@app.delete("/delete-tournament/{id}")
def delete_tournament(

    id: str,

    admin = Depends(get_current_admin)

):

    tournament = db.tournaments.find_one({

        "_id": ObjectId(id)

    })

    if not tournament:

        return {

            "error":
            "Tournament not found"

        }

    status = tournament.get(
        "status",
        ""
    )

    # =========================
    # DELETE RESULT IMAGE
    # =========================

    result_image = tournament.get(
        "result_image",
        ""
    )

    if result_image and os.path.exists(result_image):

        os.remove(result_image)

    # =========================
    # DELETE JOINED PLAYERS
    # =========================

    db.joined.delete_many({

        "tournament_id": id

    })

    # =========================
    # IF NOT COMPLETED
    # DELETE HISTORY
    # =========================

    if status != "completed":

        db.match_history.delete_many({

            "tournament_id": id

        })

        db.transactions.delete_many({

            "tournament_id": id

        })

    # =========================
    # DELETE TOURNAMENT
    # =========================

    db.tournaments.delete_one({

        "_id": ObjectId(id)

    })

    return {

        "message":
        "Tournament Deleted Successfully"

    }

@app.post("/cancel-tournament/{tournament_id}")
def cancel_tournament(
    tournament_id: str,
    user_auth = Depends(verify_admin)
):
    print("ID:", tournament_id)
    # TOURNAMENT
    tournament = db.tournaments.find_one({
        "_id": ObjectId(tournament_id)
    })

    if not tournament:

        return {
            "error": "Tournament not found"
        }

    # ALREADY CANCELLED
    if tournament.get("status") == "cancelled":

        return {
            "error": "Tournament already cancelled"
        }

    # GET JOINED USERS
    joined_users = list(

        db.joined.find({

            "tournament_id": tournament_id

        })

    )

    entry_fee = tournament.get("entry_fee", 0)

    # REFUND USERS
    for player in joined_users:

        user = db.users.find_one({
            "email": player["email"]
        })

        if user:

            new_wallet = (
                user.get("wallet", 0)
                + entry_fee
            )

            # UPDATE WALLET
            db.users.update_one(

                {
                    "email": player["email"]
                },

                {
                    "$set": {
                        "wallet": new_wallet
                    }
                }

            )

            # TRANSACTION HISTORY
            db.transactions.insert_one({

                "email": player["email"],

                "type": "REFUND",

                "amount": entry_fee,

                "status": "SUCCESS",

                "message":
                f"Refund for cancelled tournament {tournament['title']}",

                "created_at": datetime.now(timezone.utc),

                "expireAt": datetime.now(timezone.utc) + timedelta(days=30)

            })

    db.admin_wallet.update_one(

        {},

        {

            "$inc": {

                "total_balance": -entry_fee,

                "total_refunded": entry_fee,

                "profit": -entry_fee

            }

        }

    )

    # UPDATE TOURNAMENT STATUS
    result = db.tournaments.update_one(

        {
            "_id": ObjectId(tournament_id)
        },

        {
            "$set": {
                "status": "cancelled"
            }
        }

    )
    print("MODIFIED:", result.modified_count)

    updated = db.tournaments.find_one({

        "_id": ObjectId(tournament_id)

    })

    print("UPDATED STATUS:", updated["status"])

    return {
        "message": "Tournament cancelled and refund completed"
    }

# Room id & pass
@app.post("/update-room")
def update_room(data: dict, admin = Depends(verify_admin)):

    tournament_id = data.get("tournament_id")

    room_id = data.get("room_id")

    room_password = data.get("room_password")

    db.tournaments.update_one(

        {
            "_id": ObjectId(tournament_id)
        },

        {
            "$set": {

                "room_id": room_id,

                "room_password": room_password

            }
        }

    )

    return {

        "message":
        "Room Details Updated"

    }

@app.get("/my-tournaments/{email}")
def my_tournaments(email: str):

    joined = list(

        db.joined.find({
            "email": email
        })

    )

    tournaments = []

    for item in joined:

        tournament = db.tournaments.find_one({

            "_id":
            ObjectId(
                item["tournament_id"]
            )

        })
        if tournament:

            tournament["_id"] = str(
                tournament["_id"]
            )

            tournaments.append(
                tournament
            )

    return tournaments

# Add Cash
@app.post("/add-cash")
async def add_cash(

    email: str = Form(...),

    amount: int = Form(...),

    screenshot: UploadFile = File(...),

    user_auth = Depends(verify_user)

):

    try:

        # =========================
        # CREATE FOLDER
        # =========================

        os.makedirs(

            "payment_screenshots",

            exist_ok=True

        )

        # =========================
        # SAVE FILE
        # =========================

        unique_filename = (

            f"{uuid.uuid4()}_{screenshot.filename}"

        )

        file_path = (

            f"payment_screenshots/{unique_filename}"

        )

        with open(file_path, "wb") as buffer:

            shutil.copyfileobj(

                screenshot.file,

                buffer

            )

        # =========================
        # OCR
        # =========================

        extracted = extract_payment_data(

            file_path

        )

        transaction_id = extracted.get(

            "transaction_id"

        )

        extracted_amount = extracted.get(

            "amount"

        )

        # =========================
        # PAYMENT STATUS
        # =========================

        payment_status = "verified"

        # OCR FAILED
        if extracted_amount is None:

            payment_status = "manual_verify"

        # AMOUNT MISMATCH
        elif int(extracted_amount) != int(amount):

            payment_status = "amount_mismatch"
        
        payment_date = extracted.get(

            "date"

        )

        raw_text = extracted.get( "raw_text", "" )

        # =========================
        # PAYMENT STATUS
        # =========================

        success_words = [

            "completed",
            "successful",
            "paid",
            "payment successful",
            "success"

        ]

        payment_success = False

        for word in success_words:

            if word.lower() in raw_text.lower():

                payment_success = True

                break

        if not payment_success:

            os.remove(file_path)

            return {

                "error":
                "Payment status not successful"

            }

        # =========================
        # INVALID SCREENSHOT
        # =========================

        if not transaction_id:

            os.remove(file_path)

            return {

                "error":
                "Invalid screenshot. Transaction ID not found."

            }

        # =========================
        # DUPLICATE CHECK
        # =========================

        existing = db.add_cash_requests.find_one({

            "transaction_id":
            transaction_id

        })

        if existing:

            # SUCCESS
            if existing["status"] == "approved":

                os.remove(file_path)

                return {

                    "error":
                    "This payment screenshot already used."

                }

            # RETRY
            elif existing["status"] == "retry":

                pass

            # PENDING
            else:

                os.remove(file_path)

                return {

                    "error":
                    "This payment is already under verification."

                }

        # =========================
        # INSERT REQUEST
        # =========================

        request_id = db.add_cash_requests.insert_one({

            "email":
            email,

            "amount":
            amount,

            "screenshot":
            file_path,

            "transaction_id":
            transaction_id,

            "ocr_amount":
            extracted_amount,

            "payment_status": payment_status,

            "payment_date":
            payment_date,

            "status":
            "pending",

            "reason":
            "",

            "created_at":
            datetime.now(timezone.utc)

        }).inserted_id

        # =========================
        # TRANSACTION
        # =========================

        db.transactions.insert_one({

            "request_id":
            str(request_id),

            "email":
            email,

            "transaction_id":
            transaction_id,

            "type":
            "ADD_CASH",

            "amount":
            amount,

            "status":
            "PENDING",

            "message":
            "Add cash request submitted",

            "created_at":
            datetime.now(timezone.utc),

            "expireAt":

            datetime.now(timezone.utc)

            + timedelta(days=30)

        })

        return {

            "message":
            "Payment Request Submitted"

        }

    except Exception as e:

        return {

            "error":
            str(e)

        }

# GET ALL CASH REQUESTS
@app.get("/add-cash-requests")
def get_add_cash_requests(
    admin = Depends(get_current_admin)
):

    requests = list(
        db.add_cash_requests.find({})
        .sort("created_at", -1)
    )

    data = []

    for request in requests:

        data.append({

            "_id":
            str(request["_id"]),

            "email":
            request.get("email"),

            "amount":
            request.get("amount"),

            "screenshot":
            request.get("screenshot"),

            "status":
            request.get("status"),

            "reason":
            request.get("reason", ""),

            "created_at":
            request.get("created_at"),

            "payment_status": request.get("payment_status"),

            "transaction_id":
            request.get("transaction_id"),

            "ocr_amount":
            request.get("ocr_amount"),

            "payment_date":
            request.get("payment_date")

        })

    return data

# EDIT ADD CASH
@app.post("/edit-add-cash/{id}")
async def edit_add_cash(

    id: str,

    data: dict,

    admin = Depends(verify_admin)

):

    db.add_cash_requests.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "transaction_id":
                data.get("transaction_id"),

                "ocr_amount":
                data.get("ocr_amount"),

                "payment_date":
                data.get("payment_date"),

                "payment_status":
                data.get("payment_status")

            }
        }

    )

    return {

        "message":
        "Request updated successfully"

    }

# Approve add
@app.post("/approve-add-cash/{id}")
def approve_add_cash(

    id: str,

    admin = Depends(verify_admin)

):

    request = db.add_cash_requests.find_one({

        "_id": ObjectId(id)

    })

    if not request:

        return {

            "error":
            "Request not found"

        }

    if request["status"] != "pending":

        return {

            "error":
            "Already processed"

        }

    # ADD WALLET
    db.users.update_one(

        {
            "email":
            request["email"]
        },

        {
            "$inc": {

                "wallet":
                request["amount"]

            }
        }

    )

    # ADD ENTRY TO ADMIN WALLET
    db.admin_wallet.update_one(

        {},

        {

            "$inc": {

                "total_balance": request['amount']

            },

            "$set": {

                "updated_at": datetime.now(timezone.utc)

            }

        }

    )


    # UPDATE REQUEST
    db.add_cash_requests.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "approved"

            }
        }

    )

    # UPDATE TRANSACTION
    db.transactions.update_many(

        {
            "email":
            request["email"],

            "type":
            "ADD_CASH",

            "status":
            "PENDING"

        },

        {
            "$set": {

                "status":
                "SUCCESS",

                "message":
                f"₹{request['amount']} added successfully"

            }
        }

    )

    return {

        "message":
        "Cash Approved"

    }

# retry add cash
@app.post("/retry-add-cash/{id}")
def retry_add_cash(

    id: str,

    reason: str = Form(...),

    admin = Depends(verify_admin)

):

    request = db.add_cash_requests.find_one({

        "_id": ObjectId(id)

    })

    if not request:

        return {

            "error":
            "Request not found"

        }

    db.add_cash_requests.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "retry",

                "reason":
                reason

            }
        }

    )

    db.transactions.update_many(

        {
            "email":
            request["email"],

            "type":
            "ADD_CASH",

            "status":
            "PENDING"

        },

        {
            "$set": {

                "status":
                "RETRY",

                "message":
                reason

            }
        }

    )

    return {

        "message":
        "Marked As Retry"

    }

# WITHDRAW REQUEST
@app.post("/withdraw-request")
async def withdraw_request(

    data: dict,

    user_auth = Depends(verify_user)

):

    email = data.get("email")

    amount = int(data.get("amount"))

    upi_id = data.get("upi_id")

    # =========================
    # TODAY START TIME
    # =========================

    today_start = datetime.now(
        timezone.utc
    ).replace(

        hour=0,
        minute=0,
        second=0,
        microsecond=0

    )

    # =========================
    # CHECK TODAY REQUEST
    # =========================

    existing_request = db.withdraw_requests.find_one({

        "email": email,

        "created_at": {

            "$gte": today_start

        },

        "status": {

            "$in": [

                "pending",
                "approved"

            ]

        }

    })

    # =========================
    # BLOCK USER
    # =========================

    if existing_request:

        # PENDING
        if existing_request["status"] == "pending":

            return {

                "error":
                "Your previous withdraw request is still pending."

            }

        # SUCCESS
        if existing_request["status"] == "approved":

            return {

                "error":
                "Only 1 successful withdraw allowed per day."

            }

    # =========================
    # CHECK USER
    # =========================

    user = db.users.find_one({

        "email":
        email

    })

    if not user:

        return {

            "error":
            "User not found"

        }

    # =========================
    # CHECK WALLET
    # =========================

    if user.get("wallet", 0) < amount:

        return {

            "error":
            "Insufficient balance"

        }

    # =========================
    # DEDUCT WALLET
    # =========================

    db.users.update_one(

        {
            "email":
            email
        },

        {
            "$inc": {

                "wallet":
                -amount

            }
        }

    )

    # =========================
    # INSERT REQUEST
    # =========================

    request_id = db.withdraw_requests.insert_one({

        "email":
        email,

        "amount":
        amount,

        "upi_id":
        upi_id,

        "status":
        "pending",

        "reason":
        "",

        "created_at":
        datetime.now(timezone.utc)

    }).inserted_id

    # =========================
    # TRANSACTION HISTORY
    # =========================

    db.transactions.insert_one({

        "request_id":
        str(request_id),

        "email":
        email,

        "type":
        "WITHDRAW",

        "amount":
        amount,

        "status":
        "PENDING",

        "upi_id": upi_id,

        "message":
        "Withdraw request submitted",

        "created_at":
        datetime.now(timezone.utc),

        "expireAt":

        datetime.now(timezone.utc)

        + timedelta(days=30)

    })

    return {

        "message":
        "Withdraw request submitted 🚀 Amount will arrive within 24 hours."

    }

# GET WITHDRAW REQUESTS
@app.get("/withdraw-requests")
def get_withdraw_requests(

    admin = Depends(verify_admin)

):

    requests = list(

        db.withdraw_requests.find({})
        .sort("created_at", -1)

    )

    data = []

    for request in requests:

        data.append({

            "_id":
            str(request["_id"]),

            "email":
            request.get("email"),

            "amount":
            request.get("amount"),

            "upi_id":
            request.get("upi_id"),

            "status":
            request.get("status"),

            "reason":
            request.get("reason", ""),

            "created_at":
            request.get("created_at")

        })

    return data

# APPROVE WITHDRAW
@app.post("/approve-withdraw/{id}")
def approve_withdraw(

    id: str,

    admin = Depends(verify_admin)

):

    request = db.withdraw_requests.find_one({

        "_id":
        ObjectId(id)

    })

    if not request:

        return {

            "error":
            "Request not found"

        }

    if request["status"] != "pending":

        return {

            "error":
            "Already processed"

        }

    # UPDATE REQUEST
    db.withdraw_requests.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "approved"

            }
        }

    )
    # ADD ENTRY TO ADMIN WALLET
    db.admin_wallet.update_one(

        {},

        {

            "$inc": {

                "total_balance": -int(request['amount'])

            },

            "$set": {

                "updated_at": datetime.now(timezone.utc)

            }

        }

    )

    # UPDATE TRANSACTION
    db.transactions.update_many(

        {
            "email":
            request["email"],

            "type":
            "WITHDRAW",

            "status":
            "PENDING"

        },

        {
            "$set": {

                "status":
                "SUCCESS",

                "message":
                f"₹{request['amount']} withdrawn successfully"

            }
        }

    )

    return {

        "message":
        "Withdraw approved"

    }

# RETRY WITHDRAW
@app.post("/retry-withdraw/{id}")
def retry_withdraw(

    id: str,

    reason: str = Form(...),

    admin = Depends(verify_admin)

):

    request = db.withdraw_requests.find_one({

        "_id":
        ObjectId(id)

    })

    if not request:

        return {

            "error":
            "Request not found"

        }

    # REFUND WALLET
    db.users.update_one(

        {
            "email":
            request["email"]
        },

        {
            "$inc": {

                "wallet":
                request["amount"]

            }
        }

    )

    # UPDATE REQUEST
    db.withdraw_requests.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "retry",

                "reason":
                reason

            }
        }

    )

    # UPDATE TRANSACTION
    db.transactions.update_many(

        {
            "email":
            request["email"],

            "type":
            "WITHDRAW",

            "status":
            "PENDING"

        },

        {
            "$set": {

                "status":
                "RETRY",

                "message":
                reason

            }
        }

    )

    return {

        "message":
        "Marked as retry"

    }

# =========================
# GET ALL TRANSACTIONS
# =========================

@app.get("/transactions")
def get_transactions(

    admin = Depends(verify_admin)

):

    transactions = list(

        db.transactions.find({})
        .sort("created_at", -1)

    )

    data = []

    for transaction in transactions:

        data.append({

            "_id":
            str(transaction["_id"]),

            "email":
            transaction.get("email"),

            "type":
            transaction.get("type"),

            "amount":
            transaction.get("amount"),

            "upi_id": transaction.get("upi_id"),

            "status":
            transaction.get("status"),

            "message":
            transaction.get("message"),

            "transaction_id":
            transaction.get("transaction_id"),

            "created_at":
            transaction.get("created_at")

        })

    return data

# DELETE TRANSACTION
@app.delete("/delete-transaction/{id}")
def delete_transaction(

    id: str,

    admin = Depends(verify_admin)

):

    transaction = db.transactions.find_one({

        "_id":
        ObjectId(id)

    })

    if not transaction:

        return {

            "error":
            "Transaction not found"

        }

    db.transactions.delete_one({

        "_id":
        ObjectId(id)

    })

    return {

        "message":
        "Transaction deleted successfully"

    }


# EDIT TRANSACTION
@app.put("/edit-transaction/{id}")
async def edit_transaction( id: str,

    request: Request,

    admin = Depends(verify_admin)

):

    data = await request.json()

    transaction = db.transactions.find_one({

        "_id":
        ObjectId(id)

    })

    if not transaction:

        return {

            "error":
            "Transaction not found"

        }

    db.transactions.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": 
            {
                "status":
                data.get("status"),

                "message":
                data.get("message"),

                "amount":
                int(data.get("amount"))

            }
        }

    )

    return {

        "message":
        "Transaction updated successfully"

    }


@app.get("/transactions/{email}")
def transactions(email: str):

    data = list(

        db.transactions.find(

            {
                "email": email
            },

            {
                "_id": 0
            }

        )

        .sort("created_at", -1)

        .limit(20)

    )

    return data

# wallet
@app.get("/wallet")
def get_wallet(user_auth = Depends(verify_user)):

    user = db.users.find_one({
        "email": user_auth["email"]
    })

    return {
        "wallet": user.get("wallet", 0)
    }


# =========================
# GET ALL USERS
# =========================

@app.get("/all-users")
def get_all_users(

    admin = Depends(verify_admin)

):

    users = list(

        db.users.find({})

        .sort("created_at", -1)

    )

    data = []

    for user in users:

        data.append({

            "_id":
            str(user["_id"]),

            "name":
            user.get("name"),

            "email":
            user.get("email"),

            "mobile":
            user.get("mobile"),

            "wallet":
            user.get("wallet", 0),

            "matches":
            user.get("matches", 0),

            "wins":
            user.get("wins", 0),

            "profile_pic":
            user.get("profile_pic"),

            "status":
            user.get("status", "active"),

            "created_at":
            user.get("created_at")

        })

    return data

# =========================
# BAN USER
# =========================

@app.post("/ban-user/{id}")
def ban_user(

    id: str,

    admin = Depends(verify_admin)

):

    db.users.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "banned"

            }
        }

    )

    return {

        "message":
        "User banned successfully"

    }

# =========================
# UNBAN USER
# =========================

@app.post("/unban-user/{id}")
def unban_user(

    id: str,

    admin = Depends(verify_admin)

):

    db.users.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "status":
                "active"

            }
        }

    )

    return {

        "message":
        "User unbanned successfully"

    }

# =========================
# DELETE USER
# =========================

@app.delete("/delete-user/{id}")
def delete_user(

    id: str,

    admin = Depends(verify_admin)

):

    db.users.delete_one({

        "_id":
        ObjectId(id)

    })

    return {

        "message":
        "User deleted successfully"

    }

# =========================
# UPDATE USER WALLET
# =========================

@app.put("/update-wallet/{id}")
async def update_wallet(

    id: str,

    request: Request,

    admin = Depends(verify_admin)

):

    data = await request.json()

    amount = int(

        data.get("wallet")

    )

    db.users.update_one(

        {
            "_id":
            ObjectId(id)
        },

        {
            "$set": {

                "wallet":
                amount

            }
        }

    )

    return {

        "message":
        "Wallet updated successfully"

    }


# =========================
# ADMIN DASHBOARD STATS
# =========================

@app.get("/admin-dashboard-stats")
def admin_dashboard_stats(

    admin = Depends(verify_admin)

):

    total_users = db.users.count_documents({})

    total_tournaments = db.tournaments.count_documents({})

    pending_add_cash = db.add_cash_requests.count_documents({

        "status":   
        "pending"

    })

    pending_withdraw = db.withdraw_requests.count_documents({

        "status":
        "pending"

    })

    admin_wallet = db.admin_wallet.find_one() or {}

    return {

        "total_users":
        total_users,

        "total_tournaments":
        total_tournaments,

        "pending_add_cash":
        pending_add_cash,

        "pending_withdraw":
        pending_withdraw,

        "admin_wallet":
        admin_wallet.get("total_balance", 0),

        "total_profit":
        admin_wallet.get("profit", 0),

        "total_prize_paid":
        admin_wallet.get("total_prize_paid", 0)

    }

# =========================
# UPCOMING LIVE MATCHES
# =========================
@app.get("/upcoming-live-matches")
def upcoming_live_matches(

    admin = Depends(verify_admin)

):

    now = datetime.now()

    next_30_min = now + timedelta(minutes=30)

    tournaments = list(

        db.tournaments.find({})

    )

    matches = []

    for tournament in tournaments:

        try:

            raw_time = tournament.get("match_time")

            # =========================
            # HANDLE DATETIME
            # =========================

            if isinstance(raw_time, datetime):

                match_time = raw_time

                display_time = raw_time.strftime(

                    "%d %b %Y, %I:%M %p"

                )

            # =========================
            # HANDLE STRING
            # =========================

            else:

                match_time = datetime.strptime(

                    raw_time,

                    "%d %b %Y, %I:%M %p"

                )

                display_time = raw_time

            # =========================
            # NEXT 30 MIN CHECK
            # =========================

            if now <= match_time <= next_30_min:

                matches.append({

                    "_id":
                    str(tournament["_id"]),

                    "title":
                    tournament.get("title"),

                    "game_mode":
                    tournament.get("game_mode"),

                    "match_time":
                    display_time,

                    "sort_time":
                    match_time,

                    "room_id":
                    tournament.get("room_id", ""),

                    "room_password":
                    tournament.get("room_password", ""),

                    "map":
                    tournament.get("map", "Custom"),

                    "entry_fee":
                    tournament.get("entry_fee")

                })

        except Exception as e:

            print("TIME ERROR:", e)

    # =========================
    # SORT
    # =========================

    matches.sort(

        key=lambda x: x["sort_time"]

    )

    # REMOVE SORT FIELD
    for match in matches:

        match.pop("sort_time")

    return matches


# =========================
# Admin Wallet
# =========================
@app.get("/admin-wallet")
def get_admin_wallet(

    admin = Depends(verify_admin)

):

    wallet = db.admin_wallet.find_one(

        {},

        {

            "_id": 0

        }

    )

    return wallet


Thread(
    target=auto_update_tournaments,
    daemon=True
).start()