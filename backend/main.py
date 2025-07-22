from datetime import datetime
from fastapi import FastAPI, HTTPException
from sqlalchemy import create_engine, Column, Integer, String, DateTime, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import SQLAlchemyError
import os

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

app = FastAPI()

@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)

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
