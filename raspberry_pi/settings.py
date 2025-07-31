MODBUS_CLIENT_CONFIG = {
    "port": '/dev/ttyUSB0',
    "baudrate": 9600,
    "timeout": 1,
    "devices": [
        {
        "device_id": 11,
        "measurement": "HNO3",
        "addresses":{
            "value": 0x0000,
            "max_value": 0x0005,
            "number_of_sign_digits": 0x0008,
            "sensor_address": 0x000a
            }
        }
    ]
}

SERVER_URL = "http://158.160.163.158:3005"