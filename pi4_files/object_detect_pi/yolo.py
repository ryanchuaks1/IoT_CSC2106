from collections import defaultdict
from pathlib import Path

import cv2
import numpy as np
from shapely.geometry import Polygon
from shapely.geometry.point import Point

from ultralytics import YOLO
from ultralytics.utils.files import increment_path
from ultralytics.utils.plotting import Annotator, colors

from globals import set_ambulance, update_values

# from mqtt_node import cars_detected

def count_vehicles(source, model):
    cap = cv2.VideoCapture(source)

    model = YOLO(model)

    x = 0
    y = 0

    line_thickness = 2
    track_thickness = 2
    region_thickness = 2
    line_width = 2
    vid_frame_count = 0

    track_history = defaultdict(list)
    counting_regions = [
        {
            "name": "outflow",
            "polygon": Polygon([(50, 700), (600, 700), (600, 100), (50, 100)]),
            "counts": 0,
            "dragging": False,
            "region_color": (255, 42, 4),  # BGR Value
            "text_color": (255, 255, 255),  # Region Text Color
        },
        {
            "name": "inflow",
            "polygon": Polygon([(650, 700), (1200, 700), (1200, 100), (650, 100)]),
            "counts": 0,
            "dragging": False,
            "region_color": (37, 255, 225),  # BGR Value
            "text_color": (0, 0, 0),  # Region Text Color
        },
    ]
    classes_to_count = [2, 3, 5, 7]  # Vehicles
    Truck_Class = 7
    names = model.model.names

    payload = ""

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            break

        vid_frame_count += 1

        # Extract the results
        results = model.track(frame, persist=True,
                              classes=classes_to_count, save=False)
        
        if results[0].boxes.id is not None:
            boxes = results[0].boxes.xyxy.cpu()
            track_ids = results[0].boxes.id.int().cpu().tolist()
            clss = results[0].boxes.cls.cpu().tolist()

            annotator = Annotator(
                frame, line_width=line_width, example=str(names))

            for box, track_id, cls in zip(boxes, track_ids, clss):
                annotator.box_label(
                    box, str(names[cls]), color=colors(cls, True))
                bbox_center = (box[0] + box[2]) / \
                    2, (box[1] + box[3]) / 2  # Bbox center
                
                if cls == Truck_Class:
                    # set_ambulance(True)
                    print("Ambulance detected")

                track = track_history[track_id]  # Tracking Lines plot
                track.append((float(bbox_center[0]), float(bbox_center[1])))
                if len(track) > 30:
                    track.pop(0)
                points = np.hstack(track).astype(np.int32).reshape((-1, 1, 2))
                cv2.polylines(frame, [points], isClosed=False, color=colors(
                    cls, True), thickness=track_thickness)

                # Check if detection inside region
                for region in counting_regions:
                    if region["polygon"].contains(Point((bbox_center[0], bbox_center[1]))):
                        region["counts"] += 1

        # Draw regions (Polygons/Rectangles)
        for region in counting_regions:
            region_name = region["name"]
            region_label = str(region["counts"])
            region_color = region["region_color"]
            region_text_color = region["text_color"]

            polygon_coords = np.array(
                region["polygon"].exterior.coords, dtype=np.int32)
            centroid_x, centroid_y = int(region["polygon"].centroid.x), int(
                region["polygon"].centroid.y)

            text_size, _ = cv2.getTextSize(
                region_label, cv2.FONT_HERSHEY_SIMPLEX, fontScale=0.7, thickness=line_thickness
            )
            text_x = centroid_x - text_size[0] // 2
            text_y = centroid_y + text_size[1] // 2
            cv2.rectangle(
                frame,
                (text_x - 5, text_y - text_size[1] - 5),
                (text_x + text_size[0] + 5, text_y + 5),
                region_color,
                -1,
            )
            cv2.putText(
                frame, region_label, (
                    text_x, text_y), cv2.FONT_HERSHEY_SIMPLEX, 0.7, region_text_color, line_thickness
            )

            cv2.polylines(frame, [polygon_coords], isClosed=True,
                          color=region_color, thickness=region_thickness)

            if region_name == "inflow":
                x = region['counts']
            elif region_name == "outflow":
                y = region['counts']

            update_values(x, y)


        # if vid_frame_count == 1:
        #     cv2.namedWindow("Window")
        # cv2.imshow("Window", frame)

        for region in counting_regions:  # Reinitialize count for each region
            region["counts"] = 0

        # if cv2.waitKey(1) & 0xFF == ord("q"):
        #     break


    del vid_frame_count
    cap.release()
    cv2.destroyAllWindows()
    cap.release()
    cv2.destroyAllWindows()
