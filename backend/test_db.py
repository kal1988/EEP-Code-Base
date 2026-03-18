import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/employee_db")

print(f"Connecting to database: {DATABASE_URL}")

try:
    # Handle Docker host 'db' vs 'localhost' for external runs
    if "@db:5432" in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("@db:5432", "@localhost:5432")
        print(f"Mapped internal 'db' to 'localhost' for diagnostic run: {DATABASE_URL}")

    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    
    # 1. Check Tables
    print("\n--- Tables ---")
    cur.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
    """)
    tables = cur.fetchall()
    for table in tables:
        print(f"- {table[0]}")
    
    # 2. Check ActivityLog Columns
    print("\n--- activitylog columns ---")
    try:
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activitylog'")
        cols = cur.fetchall()
        for col in cols:
            print(f"- {col[0]} ({col[1]})")
    except Exception as e:
        print(f"Error checking activitylog: {e}")

    # 3. Check Employee Columns
    print("\n--- employee columns ---")
    try:
        cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'employee'")
        cols = cur.fetchall()
        for col in cols:
            print(f"- {col[0]} ({col[1]})")
    except Exception as e:
        print(f"Error checking employee: {e}")

    cur.close()
    conn.close()
    print("\nDiagnostic complete.")

except Exception as e:
    print(f"\nCRITICAL ERROR: Could not connect or query database: {e}")
    print("Ensure Docker containers are running and port 5432 is exposed.")
