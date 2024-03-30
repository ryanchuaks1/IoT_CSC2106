from serial import Serial
import time

class LoRa_Module:
    def __init__(self, usb_port = "/dev/ttyUSB0", baud_rate = 9600, payload_length = 5) -> None:
        self.port = usb_port
        self.baud_rate = baud_rate
        self.conn = Serial(self.port, self.baud_rate)
        self.payload_length = payload_length
    
    def transmit(self, message: str):
        self.conn.write((message + '\0').encode())

    def receive(self) -> str:
        while not self.conn.readable():
            time.sleep(0.1)
        payload = list(self.conn.read(self.payload_length).decode().rstrip('\0'))
        return payload

lora_module = LoRa_Module(usb_port="/dev/ttyUSB0")

while True:
    message = input("Enter a message to send: ")
    lora_module.transmit(message)
    print(lora_module.receive())
    time.sleep(1)
