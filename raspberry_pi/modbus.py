from pymodbus.client import ModbusSerialClient
from logs import log

class ModbusDevice:
    def __init__(self, device_id, measurement, addresses):
        self.device_id = device_id
        self.measurement = measurement
        self.addresses = addresses

    def read_register(self, client, address):
        response = client.read_holding_registers(address=address, count=1, device_id=self.device_id)
        if not response.isError():
            log("ModbusDevice: Успешно считаны данные:", response.registers, console_print = False)
            return response.registers
        log("ModbusDevice: Ошибка при чтении данных:", response, console_print = False)
        return None

    def read_data(self, client):
        value = self.read_register(client, self.addresses["value"])[0]
        max_value = self.read_register(client, self.addresses["max_value"])[0]
        number_of_sign_digits = self.read_register(client, self.addresses["number_of_sign_digits"])[0]
        
        log("ModbusDevice: read_data method: ", value, max_value, number_of_sign_digits, console_print=False)
        return value * (0.1 ** number_of_sign_digits)
    
    def get_measurement(self):
        return self.measurement

class ModbusClient:
    def __init__(self, config:dict):
        self.client = ModbusSerialClient(port=config["port"], baudrate=config["baudrate"], timeout=config["timeout"])
        self.connected = False
        self.devices:list[ModbusDevice] = []
        for device in config["devices"]:
            self.devices.append(
                ModbusDevice(device["device_id"], device["measurement"], device["addresses"])
                )

    def get_data(self):
        """
        Return array of pairs (measurement:str, value:int)
        """
        log("ModbusClient: start get_data", console_print = False)
        if not self.connected:
            return []
        result = []
        
        for device in self.devices:
            result.append((device.get_measurement(), device.read_data(self.client)))
        
        return result
    
    def connect(self):
        if not self.connected:
            self.connected = True
            if self.client.connect():
                log("ModbusClient: connected")
            else:
                log("ModbusClient: connection error")
    
    def close(self):
        if self.connected:
            self.connected = False
            self.client.close()
            log("ModbusClient: disconnected")

