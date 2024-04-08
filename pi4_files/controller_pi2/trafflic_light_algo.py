import time
from globals import get_traffic_data

ns_interval = 30
ew_interval = 30

max_interval = 60
min_interval = 10

curr_direction = "ns"

def set_interval(new_interval, direction):
    global ns_interval, ew_interval
    if direction == "ns":
        ns_interval = new_interval
    else:
        ew_interval = new_interval

def calculate_switch_time() -> int:
    global ns_interval, ew_interval, curr_direction
    traffic_data = get_traffic_data()
    l_inflow = traffic_data.N.inflow + traffic_data.S.inflow
    r_inflow = traffic_data.E.inflow + traffic_data.W.inflow

    if curr_direction == "ns":
        if l_inflow > r_inflow:
            ns_interval = max(ns_interval - 5, min_interval)
            ew_interval = min(ew_interval + 5, max_interval)
            curr_direction = "ew"
    else:
        if r_inflow > l_inflow:
            ns_interval = min(ns_interval + 5, max_interval)
            ew_interval = max(ew_interval - 5, min_interval)
            curr_direction = "ns"

    return ns_interval if curr_direction == "ns" else ew_interval

def main():
    while True:
        interval = calculate_switch_time()
        time.sleep(interval)

main()