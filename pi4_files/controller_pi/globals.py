from serial import Serial
import config, time

class LoRa_Module:
    def __init__(self, usb_port = "/dev/ttyUSB0", baud_rate = 9600, payload_length = 6) -> None:
        self.port = usb_port
        self.baud_rate = baud_rate
        self.conn = Serial(self.port, self.baud_rate)
        self.payload_length = payload_length
    
    def transmit(self, traffic_id: int, traffic_data: list[int]):
        message = chr(traffic_id)
        for neighbour in traffic_data:
            message += chr(neighbour)
        self.conn.write((message + '\0').encode())

    def receive(self) -> list[int]:
        while not self.conn.readable():
            time.sleep(0.1)
        payload = self.conn.read(self.payload_length).decode().rstrip('\0')
        return [ord(char) for char in payload]

class NeighbourJunction:
    def __init__(self, id) -> None:
        self.id = id
        self.inflow = 0
        self.outflow = 0
        
        self.r_inflow = 0

class MyJunction:
    def __init__(self, id) -> None:
        self.id = id
        self.north = NeighbourJunction(1)
        self.south = NeighbourJunction(2)
        self.east = NeighbourJunction(3)
        self.west = NeighbourJunction(4)

        self.lora_module = LoRa_Module("/dev/ttyUSB0")