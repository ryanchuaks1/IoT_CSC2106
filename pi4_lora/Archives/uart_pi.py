from serial import Serial
import time, struct, json

data = {
    "traffic_id": "1",
    "dir": "South",
    "vehicles_count": 25,
    "is_emergency": False
}

class LoRa_Module:
    def __init__(self, usb_port = "/dev/ttyUSB0", baud_rate = 9600) -> None:
        self.port = usb_port
        self.baud_rate = baud_rate
        self.conn = Serial(self.port, self.baud_rate)
        self.opcodes = set(["TXD", "ACK"])   
    
    def transmit(self, opcode: str, args: str = None):
        self.conn.write((opcode + '\0').encode())
        if args is not None:
            self.conn.write((args + '\0').encode())
    
    def receive(self) -> tuple[str]:
        while not self.conn.readable():
            time.sleep(1)
        opcode = self.conn.read_until(b'\0').decode()[:-1]
        if opcode in self.opcodes:
            if opcode == "ACK":
                return (opcode, None)
            else:
                data = self.conn.read_until(b'\0').decode()[:-1]
                return (opcode, data)
        else:
            return (opcode, None)

while True:
    lora_module = LoRa_Module()
    #data_str = json.dumps(data)
    message = input("Enter a message to send: ")
    lora_module.transmit("TXD", message)
    print(lora_module.receive())
    time.sleep(1)