from modbus import ModbusClient
from time import sleep
from settings import MODBUS_CLIENT_CONFIG
from logs import log
from sender import send_data

def main():
    log("Start main")
    #client = ModbusClient(MODBUS_CLIENT_CONFIG)
    #client.connect()

    for _ in range(100):
        data = ("HNO3", 42.2)
        for measurement, value in data:
            send_data(measurement, value)
        sleep(1)
    #client.close()
    

if __name__ == "__main__":
    main()
