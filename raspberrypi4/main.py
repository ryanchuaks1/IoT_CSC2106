import subprocess
import json
from typing import Dict

from yolo import count_vehicles

def startYOLOModel(source):
    count_vehicles(source, "yolov8n.pt")

def send_data(data):
    # Function to send data (You can implement the logic to send data here)
    print("Recieved data at main:", data)

def main():
    startYOLOModel("traffic.mp4")


if __name__ == "__main__":
    main()
