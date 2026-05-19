
from pymongo import MongoClient
from dotenv import load_dotenv
import os
import certifi
from datetime import datetime,timezone

# LOAD ENV FILE
load_dotenv()

# GET MONGO URL
MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL, tlsCAFile=certifi.where())

db = client["ff_tournament"]

# AUTO DELETE EXPIRED OTP
db.otps.create_index(
    "expire",
    expireAfterSeconds=0
)

# TTL INDEX
db.match_history.create_index(

    "expireAt",

    expireAfterSeconds=0

)

db.transactions.create_index(

    "expireAt",

    expireAfterSeconds=0

)

# UNIQUE JOIN INDEX
db.joined.create_index(

    [

        ("email", 1),

        ("tournament_id", 1)

    ],  

    unique= True    

)

if not db.admin_wallet.find_one():

    db.admin_wallet.insert_one({

        "total_balance": 0,

        "total_entry_collected": 0,

        "total_prize_paid": 0,

        "total_refunded": 0,

        "profit": 0,

        "updated_at": datetime.now(timezone.utc)

    })