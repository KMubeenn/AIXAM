import os
from pathlib import Path
import psycopg
from dotenv import load_dotenv

# Load environment variables from backend/.env
backend_dir = Path(__file__).resolve().parent.parent
load_dotenv(backend_dir / ".env")

def check_db_connection():
    try:
        conn = psycopg.connect(
            dbname=os.getenv("SUPABASE_DB_NAME", "postgres"),
            user=os.getenv("SUPABASE_DB_USER"),
            password=os.getenv("SUPABASE_DB_PASSWORD"),
            host=os.getenv("SUPABASE_DB_HOST"),
            port=int(os.getenv("SUPABASE_DB_PORT", 5432)),
        )
        print("Connection successful!")
        conn.close()
        return True
    except Exception as e:
        print("Connection failed:", e)
        return False

if __name__ == "__main__":
    check_db_connection()
