import paho.mqtt.client as mqtt
import config
import threading
import time
from serial import Serial
import ast


hostname = config.ip_addr
broker_port = config.port
topic = "meowmeowmeowmeow"

meowmeow = []

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic)

def on_message(client, userdata, msg):
    payload_str = msg.payload.decode("utf-8")
    msg_dict = ast.literal_eval(payload_str)
    direction = msg_dict['direction']
    x = msg_dict['inflow']
    y = msg_dict['outflow']
    meowmeow.append({'direction': direction, 'x': x, 'y': y})

def initialise_mqtt():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    client.on_connect = on_connect
    client.on_message = on_message

    client.connect(hostname, broker_port, 60)
    return client

def mqtt_transmission():
    client = initialise_mqtt()
    while True:
        client.loop()

class LoRa_Module:
    def __init__(self, usb_port = "/dev/ttyUSB0", baud_rate = 9600, payload_length = 32) -> None:
        self.port = usb_port
        self.baud_rate = baud_rate
        self.conn = Serial(self.port, self.baud_rate)
        self.payload_length = payload_length
    
    def transmit(self, message: str):
        self.conn.write((message + '\0').encode())

    def receive(self) -> str:
        while not self.conn.readable():
            time.sleep(0.1)
        payload = self.conn.read(self.payload_length)
        return payload


def lora_transmission():
    lora_module = LoRa_Module(usb_port="/dev/ttyUSB0")
    
    while True:
        print(lora_module.receive())
        time.sleep(1)

def junction_algo():
    while True:
        if meowmeow:
            for data in meowmeow:
                direction = data['direction']
                x = data['x']
                y = data['y']
                # Process the data here as needed
                print(f"Direction from junction: {direction}, X: {x}, Y: {y}")
            meowmeow.clear()
        time.sleep(10)

def main():
    threading.Thread(target=mqtt_transmission, daemon=True).start()
    threading.Thread(target=lora_transmission, daemon=True).start()
    threading.Thread(target=junction_algo, daemon=True).start()

if __name__ == "__main__":
    main()
    while True:
        pass
