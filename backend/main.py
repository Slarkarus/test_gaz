from datetime import datetime
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import os
import asyncio
from contextlib import asynccontextmanager

DATABASE_URL = os.getenv("DB_URL", "postgresql+psycopg2://postgres:postgres@db:5432/measurements_db")

Base = declarative_base()
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Measurement(Base):
    __tablename__ = "measurements"
    id = Column(Integer, primary_key=True, index=True)
    device_id = Column(Integer, nullable=False)
    metric_name = Column(String(50), nullable=False)
    value = Column(Integer, nullable=False)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow)

async def wait_for_db():
    retries = 5
    delay = 2  # seconds
    for attempt in range(retries):
        try:
            with SessionLocal() as session:
                session.execute(text("SELECT 1"))
                print("✅ Database connection successful")
                return
        except SQLAlchemyError as e:
            if attempt == retries - 1:
                raise Exception(f"❌ Failed to connect to database after {retries} attempts") from e
            print(f"⚠️ Database connection failed (attempt {attempt+1}/{retries}), retrying in {delay}s...")
            await asyncio.sleep(delay)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Wait for database to be ready
    await wait_for_db()
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/devices")
def get_devices():
    with SessionLocal() as session:
        result = session.execute(text("SELECT DISTINCT device_id FROM measurements"))
        return [row[0] for row in result]

@app.get("/metrics")
def get_metrics():
    with SessionLocal() as session:
        result = session.execute(text("SELECT DISTINCT metric_name FROM measurements"))
        return [row[0] for row in result]

@app.get("/data/{device_id}/{metric_name}")
def get_data(device_id: int, metric_name: str):
    with SessionLocal() as session:
        query = text("""
            SELECT device_id, metric_name, value, timestamp
            FROM measurements
            WHERE device_id = :device_id AND metric_name = :metric_name
            ORDER BY timestamp DESC
            LIMIT 100
        """)
        result = session.execute(query, {"device_id": device_id, "metric_name": metric_name})
        return [dict(row) for row in result.mappings()]

@app.post("/add")
def add_measurement(device_id: int, metric_name: str, value: int, timestamp: datetime):
    try:
        with SessionLocal() as session:
            new_measurement = Measurement(
                device_id=device_id,
                metric_name=metric_name,
                value=value,
                timestamp=timestamp
            )
            session.add(new_measurement)
            session.commit()
        return {"status": "success"}
    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Database error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)