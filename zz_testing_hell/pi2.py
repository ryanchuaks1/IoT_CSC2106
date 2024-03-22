import paho.mqtt.client as mqtt
import config
import threading
import time
from yolo import count_vehicles

hostname = config.ip_addr
broker_port = config.port
topic = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

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
        client.publish(topic, "Message sent")
        time.sleep(5)

def yolov8_task():
    while True:
        count_vehicles("traffic.mp4", "yolov8n.pt")

def main():
    threading.Thread(target=mqtt_transmission, daemon=True).start()
    threading.Thread(target=yolov8_task, daemon=True).start()

if __name__ == "__main__":
    main()
    while True:
        pass
