import paho.mqtt.client as mqtt
import pi4_files.controller_pi.config as config
import threading
import time
from serial import Serial
from globals import MyJunction
from random import Random


hostname = config.ip_addr
broker_port = config.port
topic = "meowmeowmeowmeow"

my_junction = MyJunction(1,2,6,4,5)
topic_buffer = []

def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic)


def on_message(client, userdata, msg):
    payload_str = msg.payload.decode("utf-8")
    msg_dict = ast.literal_eval(payload_str)
    direction = msg_dict['direction']
    x = msg_dict['inflow']
    y = msg_dict['outflow']
    topic_buffer.append({'direction': direction, 'x': x, 'y': y})


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

def transmit_to_lora_thread():
    my_junction.lora_module.transmit(my_junction.id, [Random.randint(0, 127), Random.randint(0, 127), Random.randint(0, 127), Random.randint(0, 127)])
    time.sleep(10 * 1000)

def receive_from_lora_thread():
    traffic_data = my_junction.lora_module.receive()
    
    if my_junction.north.id == traffic_data[0]:
        my_junction.south.r_inflow = traffic_data[2]
    elif my_junction.south.id == traffic_data[0]:
        my_junction.north.r_inflow = traffic_data[1]
    elif my_junction.east.id == traffic_data[0]:
        my_junction.west.r_inflow = traffic_data[4]
    elif my_junction.west.id == traffic_data[0]:
        my_junction.east.r_inflow = traffic_data[3]

    print("Traffic ID:", traffic_data[0], "Counts:", traffic_data[1:])

def handle_mqtt_buffer_thread():
    while len(topic_buffer) > 0:
        direction = topic_buffer[-1]['direction']
        inflow_count = topic_buffer[-1]['x']
        outflow_count = topic_buffer[-1]['y']

        if direction == "north":
            my_junction.north.inflow = inflow_count
            my_junction.north.outflow = outflow_count
        elif direction == "east":
            my_junction.east.inflow = inflow_count
            my_junction.east.outflow = outflow_count
        elif direction == "south":
            my_junction.south.inflow = inflow_count
            my_junction.south.outflow = outflow_count
        elif direction == "west":
            my_junction.west.inflow = inflow_count
            my_junction.west.outflow = outflow_count

        topic_buffer.pop()
    
    time.sleep(10)

def decision_thread():
    ns_interval = 30
    ew_interval = 30
    min_interval = 20
    max_interval = 40
    curr_direction = "ns"

    if curr_direction == "ns":
        if (my_junction.north.inflow * 0.8 + my_junction.north.r_inflow * 0.2) + \
        (my_junction.south.inflow * 0.8 + my_junction.south.r_inflow * 0.2) > config.avg_traffic_ns:
            ns_interval = ns_interval + 2 if ns_interval < max_interval else ns_interval
            print("New NS interval", ns_interval)
        else:
            ns_interval = ns_interval - 2 if ns_interval > min_interval else ns_interval
            print("New NS interval", )
    else:
        if (my_junction.east.inflow * 0.8 + my_junction.east.r_inflow * 0.2) + \
            (my_junction.west.inflow * 0.8 + my_junction.west.r_inflow * 0.2) > config.avg_traffic_ew:
            ew_interval = ew_interval + 2 if ew_interval < max_interval else ew_interval
            print("New EW interval", ew_interval)
        else:
            ew_interval = ew_interval - 2 if ew_interval > min_interval else ew_interval
            print("New EW interval", ew_interval)

    print("Current traffic direction", curr_direction, " Duration is:", ns_interval if curr_direction == "ns" else ew_interval)

def main():
    #threading.Thread(target=mqtt_transmission, daemon=True).start()
    #threading.Thread(target=handle_mqtt_buffer_thread, daemon=True).start()
    threading.Thread(target=transmit_to_lora_thread, daemon=True).start()
    threading.Thread(target=receive_from_lora_thread, daemon=True).start()
    #threading.Thread(target=decision_thread, daemon=True).start()


if __name__ == "__main__":
    main()
    while True:
        pass
