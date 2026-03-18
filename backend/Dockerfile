FROM python:3.10-slim

WORKDIR /app

# Install dependencies needed for PostgreSQL driver (psycopg2) if using it, 
# though sqlmodel often uses psycopg2-binary which still might need build essentials.
# Actually python:3.10-slim usually handles psycopg2-binary fine without gcc.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
