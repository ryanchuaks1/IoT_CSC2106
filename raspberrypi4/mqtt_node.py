
import paho.mqtt.client as mqtt
import config

hostname = config.ip_addr
broker_port = config.port
topic = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"


def on_connect(client, userdata, flags, reason_code, properties):
        print(f"Connected with result code {reason_code}")
        client.subscribe(topic)

def on_message(client, userdata, msg):
        print(msg.topic+" "+str(msg.payload))

controller = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

controller.on_connect = on_connect
controller.on_message = on_message

controller.connect(hostname, broker_port, 60)

controller.loop_forever()
