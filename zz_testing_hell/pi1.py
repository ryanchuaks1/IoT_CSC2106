import paho.mqtt.client as mqtt
import config
import threading
import time
from serial import Serial


hostname = config.ip_addr
broker_port = config.port
topic = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
message = "Message from Pi-zz"

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))

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
        client.publish(topic, message)
        time.sleep(5)

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
        lora_module.transmit(message)
        print(lora_module.receive())
        time.sleep(1)

def main():
    threading.Thread(target=mqtt_transmission, daemon=True).start()
    threading.Thread(target=lora_transmission, daemon=True).start()

if __name__ == "__main__":
    main()
    while True:
        pass
