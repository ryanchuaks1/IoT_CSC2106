import paho.mqtt.client as mqtt
import ast
import config
import threading
import time
from serial import Serial
from globals import MyJunction
import random


hostname = config.ip_addr
broker_port = config.port
topic = "meowmeowmeowmeow"

my_junction = MyJunction(2, 3, 1, 4, 5)


def on_connect(client, userdata, flags, reason_code, properties):
    print(f"Connected with result code {reason_code}")
    client.subscribe(topic)


def on_message(client, userdata, msg):
    payload_str = msg.payload.decode("utf-8")
    msg_dict = ast.literal_eval(payload_str)
    direction = msg_dict['direction']
    inflow_count = msg_dict['inflow']
    outflow_count = msg_dict['outflow']

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
    print(my_junction.north.inflow, my_junction.north.outflow, my_junction.east.inflow, my_junction.east.outflow,
          my_junction.south.inflow, my_junction.south.outflow, my_junction.west.inflow, my_junction.west.outflow)


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
    while True:
        my_junction.lora_module.transmit(my_junction.id, [
                                         my_junction.north.outflow, my_junction.south.outflow, my_junction.east.outflow, my_junction.west.outflow])
        time.sleep(1)


def receive_from_lora_thread():
    while True:
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


def decision_thread():
    ns_interval = 30  # Current interval of North - South
    ew_interval = 30  # Current interval of East - West

    min_interval = 20
    max_interval = 40

    curr_traffic_time = 0

    curr_direction = "ns"

    while True:
        while curr_direction == "ns":
            # If ambulance in current directtion, delay traffic light 5 more seconds
            if (check_ambulance() == "ns"):
                time.sleep(5)
            # If ambulance in opposite direction, switch traffic light
            elif (check_ambulance() == "ew"):
                print("Amber light for 5 seconds")
                time.sleep(5)
                curr_direction = "ew"
                break

            if curr_traffic_time == ns_interval - 5:  # If traffic light time is about to end start amber
                print("Amber light for 5 seconds")
                time.sleep(5)
                if ((my_junction.north.inflow * 0.8 + my_junction.north.r_inflow * 0.2) +
                        (my_junction.south.inflow * 0.8 + my_junction.south.r_inflow * 0.2)) > config.avg_traffic_ns:
                    ns_interval = ns_interval + 2 if ns_interval < max_interval else ns_interval
                    print("New NS interval", ns_interval)
                else:
                    ns_interval = ns_interval - 2 if ns_interval > min_interval else ns_interval
                    print("New NS interval", ns_interval,
                          "Time", curr_traffic_time)

            print("Current traffic direction",
                  curr_direction, "Time", curr_traffic_time)
            curr_traffic_time += 1
            time.sleep(1)

        while curr_direction == "ew":
            # If ambulance in current directtion, delay traffic light 5 more seconds
            if (check_ambulance() == "ew"):
                time.sleep(5)
            # If ambulance in opposite direction, switch traffic light
            elif (check_ambulance() == "ns"):
                print("Amber light for 5 seconds")
                time.sleep(5)
                curr_direction = "ns"
                break

            if curr_traffic_time == ew_interval - 5:  # If traffic light time is about to end start amber
                print("Amber light for 5 seconds")
                time.sleep(5)
                if ((my_junction.east.inflow * 0.8 + my_junction.east.r_inflow * 0.2) +
                        (my_junction.west.inflow * 0.8 + my_junction.west.r_inflow * 0.2)) > config.avg_traffic_ew:
                    ew_interval = ew_interval + 2 if ew_interval < max_interval else ew_interval
                    print("New EW interval", ew_interval)
                else:
                    ew_interval = ew_interval - 2 if ew_interval > min_interval else ew_interval
                    print("New EW interval", ew_interval,
                          "Time", curr_traffic_time)

            print("Current traffic direction",
                  curr_direction, "Time", curr_traffic_time)
            curr_traffic_time += 1
            time.sleep(1)


def check_ambulance():
    if my_junction.north.inflow == 127 or my_junction.south.inflow == 127:
        return "ns"
    elif my_junction.east.inflow == 127 or my_junction.west.inflow == 127:
        return "ew"


def main():
    # threading.Thread(target=mqtt_transmission, daemon=True).start()
    # threading.Thread(target=handle_mqtt_buffer_thread, daemon=True).start()
    threading.Thread(target=transmit_to_lora_thread, daemon=True).start()
    threading.Thread(target=receive_from_lora_thread, daemon=True).start()
    # threading.Thread(target=decision_thread, daemon=True).start()


if __name__ == "__main__":
    main()
    while True:
        pass
