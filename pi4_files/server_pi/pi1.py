import ast
import config
import threading
import time
from serial import Serial
from globals import MyJunction
import random

my_junction = MyJunction(3,2,6,4,5)

def transmit_to_lora_thread():
    while True:
        my_junction.lora_module.transmit(my_junction.id, [my_junction.north.outflow, my_junction.south.outflow, my_junction.east.outflow, my_junction.west.outflow])
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

def main():
    #threading.Thread(target=mqtt_transmission, daemon=True).start()
    #threading.Thread(target=handle_mqtt_buffer_thread, daemon=True).start()
    #threading.Thread(target=transmit_to_lora_thread, daemon=True).start()
    threading.Thread(target=receive_from_lora_thread, daemon=True).start()
    #threading.Thread(target=decision_thread, daemon=True).start()


if __name__ == "__main__":
    main()
    while True:
        pass
