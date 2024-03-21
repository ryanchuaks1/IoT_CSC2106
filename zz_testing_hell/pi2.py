import paho.mqtt.client as mqtt
import config
import threading
import time

hostname = config.ip_addr
broker_port = config.port
topic = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic)

def on_message(client, userdata, msg):
    print(msg.topic + " " + str(msg.payload))

def on_publish(client, userdata):
    print("Message published")

def initialise_mqtt():
    client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    client.on_connect = on_connect
    client.on_message = on_message
    client.on_publish = on_publish

    client.connect(hostname, broker_port, 60)
    return client

def mqtt_transmission():
    client = initialise_mqtt()
    while True:
        client.loop()
        client.publish(topic, "Message sent")
        time.sleep(5)

def increment_and_print():
    x = 0
    while True:
        x += 1
        print(f"x: {x}")
        time.sleep(1)

def main():
    threading.Thread(target=mqtt_transmission, daemon=True).start()
    threading.Thread(target=increment_and_print, daemon=True).start()

if __name__ == "__main__":
    main()
    while True:
        pass
