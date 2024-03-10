// Import dependencies
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../services/mongodb");

const trafficDataRoutes = express.Router();

// Get all traffic data
trafficDataRoutes.get("/", async (req, res) => {
  const db = getDB();
  const trafficDataCollection = db.collection("trafficdata");

  try {
    const allTrafficData = await trafficDataCollection.find().toArray();

    res.status(200).json(allTrafficData);
  } catch (error) {
    console.error("Error getting all traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// Add traffic data
trafficDataRoutes.post("/", async (req, res) => {
  let trafficData = req.body.traffic_data;

  const db = getDB();
  const trafficDataCollection = db.collection("trafficdata");

  // Check if trafficData is an array or a single object
  if (!Array.isArray(trafficData)) {
    trafficData = [trafficData];
  }

  try {
    const result = await trafficDataCollection.insertMany(trafficData);
    res
      .status(201)
      .json({ result: true, message: "Traffic data added successfully!" });
  } catch (error) {
    console.error("Error adding traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// Get traffic data by `traffic_id`
trafficDataRoutes.get("/:traffic_id", async (req, res) => {
  const trafficId = req.params.traffic_id;

  const db = getDB();
  const trafficDataCollection = db.collection("trafficdata");

  try {
    let query = {};

    if (trafficId) {
      query = { traffic_id: trafficId };
    }

    const allTrafficData = await trafficDataCollection.find(query).toArray();

    if (allTrafficData.length > 0) {
      res.status(200).json(allTrafficData);
    } else {
      res
        .status(404)
        .json({ result: false, message: "Traffic data not found" });
    }
  } catch (error) {
    console.error("Error getting traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// Update traffic data by `object_id`
trafficDataRoutes.put("/:object_id", async (req, res) => {
  const objectId = req.params.object_id;
  const trafficData = req.body.traffic_data;

  const db = getDB();
  const trafficDataCollection = db.collection("trafficdata");

  try {
    const updateResult = await trafficDataCollection.updateOne(
      { _id: ObjectId(objectId) },
      {
        $set: {
          lane_direction: trafficData.lane_direction,
          number_of_vehicles: trafficData.number_of_vehicles,
          isEmergency: trafficData.isEmergency,
        },
      }
    );

    res
      .status(201)
      .json({ result: true, message: "Traffic data updated successfully!" });
  } catch (error) {
    console.error("Error updating traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// Delete traffic data by `object_id`
trafficDataRoutes.delete("/:object_id", async (req, res) => {
  const objectId = req.params.object_id;

  const db = getDB();
  const trafficDataCollection = db.collection("trafficdata");

  try {
    const deleteResult = await trafficDataCollection.deleteOne({
      _id: ObjectId(objectId),
    });
    res
      .status(201)
      .json({ result: true, message: "Traffic data deleted successfully!" });
  } catch (error) {
    console.error("Error deleting traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

module.exports = trafficDataRoutes;
