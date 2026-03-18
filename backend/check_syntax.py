import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

try:
    from main import app
    print("Syntax and imports OK")
except Exception as e:
    print(f"ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
