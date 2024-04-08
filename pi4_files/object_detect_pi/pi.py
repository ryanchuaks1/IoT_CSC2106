import paho.mqtt.client as mqtt
import config
import threading
import time
from yolo import count_vehicles
from globals import check_ambulance, get_x, get_y, get_time, set_ambulance

hostname = config.ip_addr
broker_port = config.port
topic = config.topic
direction = config.direction

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

def yolov8_task():
    while True:
        count_vehicles("traffic.mp4", "yolov8n.pt")

def cars_detection_task():
    client = initialise_mqtt()
    old_t = get_time()
    while True:
        x = get_x()
        y = get_y()
        curr_t = get_time()

        if check_ambulance():
            msg = {
                'direction': direction,
                'inflow': 127,
                'outflow': 127
            }
            client.publish(topic, str(msg))
            set_ambulance(False)
        elif curr_t != old_t:
            msg = {
                'direction': direction,
                'inflow': x,
                'outflow': y
            }
            client.publish(topic, str(msg))
            old_t = curr_t

        time.sleep(1)


def main():
    threading.Thread(target=yolov8_task, daemon=True).start()
    threading.Thread(target=cars_detection_task, daemon=True).start()

if __name__ == "__main__":
    main()
    while True:
        pass
