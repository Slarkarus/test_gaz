import requests
from datetime import datetime
from logs import log
from settings import SERVER_URL


def send_data(measurement: str, value: float, timestamp: datetime = None):
    timestamp = timestamp.isoformat() if timestamp else datetime.utcnow().isoformat()
    
    payload = {
        "measurement": measurement,
        "value": value,
        "timestamp": timestamp + "Z"
    }
    
    try:
        response = requests.post(
            f"{SERVER_URL}"/measurement"/sendData",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        log(f"Данные успешно отправлены: {measurement}={value} в {timestamp}")
    except requests.exceptions.RequestException as e:
        log(f"Ошибка при отправке данных: {str(e)}")

