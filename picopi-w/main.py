import network
import time
import config
from umqtt.simple import MQTTClient


def connect_wifi():
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(config.SSID, config.SSID_PASSWORD)
    print('Waiting for connection...')
    while wlan.isconnected() == False:
        print('Waiting for connection...')
        time.sleep(1)
    print('Connected to wifi')

def connect_mqtt():
    client = MQTTClient("test", config.MQTT_SERVER, port=config.MQTT_PORT)
    print('Waiting for connection...')
    try:
        client.connect()
        print("Connected to MQTT broker")
    except Exception as e:
        print("Error connecting to MQTT broker:", e)

connect_wifi()
connect_mqtt()


