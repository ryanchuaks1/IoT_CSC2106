class Direction:
    def __init__(self) -> None:
        self.inflow = 0
        self.r_inflow = 0
        self.outflow = 0

class TrafficData:
    def __init__(self) -> None:
        self.N = Direction()
        self.E = Direction()
        self.S = Direction()
        self.W = Direction()

traffic_data: TrafficData = TrafficData()

def get_traffic_data():
    return traffic_data

