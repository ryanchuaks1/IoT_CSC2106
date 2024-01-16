import subprocess
import json
from typing import Dict


def install_dependencies():
    requirements_file = "requirements.txt"
    subprocess.run(["pip", "install", "-r", requirements_file])


def startYOLOModel(source) -> str:
    subprocess.run(["python", "yolo.py", "--weights", "yolov8l.pt",
                   "--source", source, "--view-img",])
    vehicle_count = {

    }

    vehicle_count_json = json.dumps(vehicle_count)

    return vehicle_count_json


def main():
    # install_dependencies()
    startYOLOModel("traffic.mp4")


if __name__ == "__main__":
    main()
