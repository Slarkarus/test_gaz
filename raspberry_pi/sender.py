import requests
import json
from datetime import datetime, timedelta
from logs import log

BASE_URL = "http://localhost:3005/measurement"

def send_data(measurement: str, value: float, timestamp: datetime = None):
    timestamp = timestamp.isoformat() if timestamp else datetime.utcnow().isoformat()
    
    payload = {
        "measurement": measurement,
        "value": value,
        "timestamp": timestamp + "Z"
    }
    
    try:
        response = requests.post(
            f"{BASE_URL}/sendData",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        response.raise_for_status()
        log(f"Данные успешно отправлены: {measurement}={value} в {timestamp}")
    except requests.exceptions.RequestException as e:
        log(f"Ошибка при отправке данных: {str(e)}")

def get_data(measurement: str = None, timestamp: str = None):
    """
    Получает данные измерений с сервера
    
    Параметры:
    measurement (str): Фильтр по типу измерения (опционально)
    timestamp (str): Фильтр по временной метке (опционально)
    
    Возвращает:
    list: Список словарей с данными измерений
    """
    params = {}
    if measurement:
        params["measurement"] = measurement
    if timestamp:
        params["timestamp"] = timestamp
    
    try:
        response = requests.get(
            f"{BASE_URL}/getData",
            params=params
        )
        response.raise_for_status()
        data = response.json()
        print(f"Получено {len(data)} записей")
        return data
    except requests.exceptions.RequestException as e:
        print(f"Ошибка при получении данных: {str(e)}")
        return []
    except json.JSONDecodeError:
        print("Ошибка декодирования ответа сервера")
        return []

def getAllMeasurementTypes():
    try:
        response = requests.get(
            f"{BASE_URL}/measurementTypes"
        )
        response.raise_for_status()
        data = response.json()
        log(f"Получено {len(data)} записей")
        return data
    except requests.exceptions.RequestException as e:
        log(f"Ошибка при получении данных: {str(e)}")
        return []
    except json.JSONDecodeError:
        log("Ошибка декодирования ответа сервера")
        return []

# Примеры использования
if __name__ == "__main__":
    # Отправка данных
    send_data("temperature", 25.5)
    send_data("humidity", 42.3)
    
    # Получение всех данных
    all_data = get_data(measurement = "temperature", timestamp = (datetime.utcnow()).isoformat() )
    for value in all_data:
        print(value)
    print("Все данные:", all_data)
    
    # Получение отфильтрованных данных
    temp_data = get_data(measurement="temperature")
    print("Данные температуры:", temp_data)
    print(getAllMeasurementTypes())
