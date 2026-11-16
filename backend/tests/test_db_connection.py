import psycopg

try:
    conn = psycopg.connect(
        dbname="postgres",
        user="postgres.ttxmtfhksylzomwoiuft",
        password="Aixam12123..",
        host="aws-1-ap-northeast-1.pooler.supabase.com",
        port=5432
    )
    print("Connection successful!")
    conn.close()
except Exception as e:
    print("Connection failed:", e)
