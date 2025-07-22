import minimalmodbus
import requests
import time
import json
from datetime import datetime, timezone
import os

# Конфигурация Modbus
SLAVE_ADDRESS = 11
SERIAL_PORT = '/dev/ttyUSB0'
BAUDRATE = 9600

# Конфигурация сервера
SERVER_URL = "http://158.160.163.158:8000/add"
DEVICE_ID = 11  # ID устройства (совпадает с адресом slave)

# Создание объекта инструмента Modbus
instrument = minimalmodbus.Instrument(SERIAL_PORT, SLAVE_ADDRESS)
instrument.serial.baudrate = BAUDRATE
instrument.serial.bytesize = 8
instrument.serial.parity = minimalmodbus.serial.PARITY_NONE
instrument.serial.stopbits = 1
instrument.serial.timeout = 1.0  # секунды

# Файл для хранения неотправленных данных
BACKUP_FILE = "unsent_data.json"

def read_modbus_data():
    """Считывание данных с Modbus устройства"""
    try:
        # Чтение регистров
        concentration = instrument.read_register(0, 0)  # регистр 0000
        upper_range = instrument.read_register(5, 0)     # регистр 0005
        decimals = instrument.read_register(8, 0)        # регистр 0008
        
        # Применение коэффициента к концентрации
        divisor = 10 ** decimals
        concentration_value = concentration / divisor
        
        # Получение текущего времени в UTC
        timestamp = datetime.now(timezone.utc).isoformat()
        
        return {
            "concentration": concentration_value,
            "upper_range": upper_range,
            "decimals": decimals,
            "timestamp": timestamp
        }
    except Exception as e:
        print(f"Ошибка чтения Modbus: {e}")
        return None

def send_to_server(data):
    """Отправка данных на сервер"""
    measurements = [
        {"metric_name": "concentration", "value": data["concentration"]},
        {"metric_name": "upper_range", "value": data["upper_range"]},
        {"metric_name": "decimals", "value": data["decimals"]}
    ]
    
    for measurement in measurements:
        payload = {
            "device_id": DEVICE_ID,
            "metric_name": measurement["metric_name"],
            "value": measurement["value"],
            "timestamp": data["timestamp"]
        }
        
        try:
            response = requests.post(SERVER_URL, json=payload, timeout=5)
            if response.status_code == 200:
                print(f"Данные отправлены: {measurement['metric_name']} = {measurement['value']}")
            else:
                raise Exception(f"HTTP ошибка: {response.status_code}")
        except Exception as e:
            print(f"Ошибка отправки: {e}")
            save_to_backup(payload)
            return False
    return True

def save_to_backup(data):
    """Сохранение данных в файл для последующей отправки"""
    try:
        # Чтение существующих данных
        unsent_data = []
        if os.path.exists(BACKUP_FILE):
            with open(BACKUP_FILE, 'r') as f:
                unsent_data = json.load(f)
        
        # Добавление новых данных
        unsent_data.append(data)
        
        # Сохранение обновленных данных
        with open(BACKUP_FILE, 'w') as f:
            json.dump(unsent_data, f)
            
        print(f"Данные сохранены в {BACKUP_FILE}")
    except Exception as e:
        print(f"Ошибка сохранения в файл: {e}")

def send_backup_data():
    """Отправка данных из резервного файла"""
    if not os.path.exists(BACKUP_FILE):
        return
        
    try:
        with open(BACKUP_FILE, 'r') as f:
            unsent_data = json.load(f)
        
        # Попытка отправить все данные
        successful_sends = []
        for data in unsent_data:
            try:
                response = requests.post(SERVER_URL, json=data, timeout=5)
                if response.status_code == 200:
                    successful_sends.append(data)
                    print(f"Отправлены резервные данные: {data}")
                else:
                    print(f"Ошибка HTTP для резервных данных: {response.status_code}")
            except Exception as e:
                print(f"Ошибка отправки резервных данных: {e}")
        
        # Удаление успешно отправленных данных
        remaining_data = [d for d in unsent_data if d not in successful_sends]
        
        if remaining_data:
            with open(BACKUP_FILE, 'w') as f:
                json.dump(remaining_data, f)
            print(f"Осталось {len(remaining_data)} неотправленных записей")
        else:
            os.remove(BACKUP_FILE)
            print("Все резервные данные успешно отправлены")
            
    except Exception as e:
        print(f"Ошибка обработки резервного файла: {e}")

def main():
    print("Запуск мониторинга Modbus устройства...")
    print(f"Устройство: {DEVICE_ID}, Порт: {SERIAL_PORT}")
    print(f"Сервер: {SERVER_URL}")
    
    while True:
        try:
            # Попытка отправить резервные данные
            send_backup_data()
            
            # Чтение текущих данных
            modbus_data = read_modbus_data()
            if modbus_data:
                print("Считанные данные:")
                print(f"Концентрация: {modbus_data['concentration']}")
                print(f"Верхний диапазон: {modbus_data['upper_range']}")
                print(f"Десятичные разряды: {modbus_data['decimals']}")
                
                # Отправка данных на сервер
                if not send_to_server(modbus_data):
                    print("Ошибка отправки данных, сохранено в резерв")
        
        except Exception as e:
            print(f"Ошибка в основном цикле: {e}")
        
        # Ожидание перед следующим чтением
        time.sleep(5)

if __name__ == "__main__":
    main()