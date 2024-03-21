// Import dependencies
const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../services/mongodb");

const trafficDataRoutes = express.Router();

// Get all traffic data
trafficDataRoutes.get("/", async (req, res) => {
  const mongodbClient = getDB();
  const trafficDataCollection = mongodbClient.collection("traffic_data");

  try {
    // Get all traffic data from the database
    const allTrafficData = await trafficDataCollection.find().toArray();

    // Sort traffic data by `updated_at` in descending order
    allTrafficData.sort((a, b) => b.updated_at - a.updated_at);

    res.status(200).json(allTrafficData);
  } catch (error) {
    console.error("Error getting all traffic data:", error);
    res.status(500).json({ result: false, message: "Internal server error" });
  }
});

// Add traffic data
trafficDataRoutes.post("/", async (req, res) => {
  let trafficData = req.body.traffic_data;

  const mongodbClient = getDB();
  const trafficDataCollection = mongodbClient.collection("traffic_data");

  // Get same timestamp for all traffic data in request
  const currentTime = new Date();

  // Check if trafficData is an array or a single object
  if (!Array.isArray(trafficData)) {
    trafficData = [trafficData];
  }

  // Check for missing `traffic_id` in traffic data
  const missingTrafficId = trafficData.some(
    (data) => data.traffic_id === undefined
  );
  if (missingTrafficId) {
    res.status(400).json({
      result: false,
      message: "Traffic ID is required for all traffic data",
    });
  }

  // Add timestamp for each traffic data
  trafficData = trafficData.map((data) => {
    return { ...data, timestamp: currentTime };
  });

  try {
    await Promise.all(trafficData.map(async (data) => {
      // Check if `traffic_id` already exists in the database
      const existingTrafficData = await trafficDataCollection.findOne({
        traffic_id: data.traffic_id,
      });

      if (existingTrafficData) {
        // Update `timestamp` for existing `traffic_data` record
        operationResult = await trafficDataCollection.updateOne(
          { traffic_id: data.traffic_id },
          { $set: { updated_at: currentTime } }
        );
      } else {
        // Insert `traffic_id` record into `traffic_data` collection
        operationResult = await trafficDataCollection.insertOne({
          traffic_id: data.traffic_id,
          updated_at: currentTime,
        });
      }

      // Add traffic data into `traffic_id` collection
      const trafficIdCollection = mongodbClient.collection(
        "traffic_" + data.traffic_id
      );
      await trafficIdCollection.insertOne(data);
    }));

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

  const mongodbClient = getDB();
  const trafficIdCollection = mongodbClient.collection("traffic_" + trafficId);

  try {
    // Get traffic data from the database
    const allTrafficData = await trafficIdCollection.find().toArray();

    // Sort traffic data by `timestamp` in descending order
    allTrafficData.sort((a, b) => b.timestamp - a.timestamp);

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

// Update traffic data by `object_id` in `traffic_id` collection
trafficDataRoutes.put("/:traffic_id/:object_id", async (req, res) => {
  const trafficId = req.params.traffic_id;
  const objectId = req.params.object_id;
  const trafficData = req.body.traffic_data;

  const mongodbClient = getDB();
  const trafficIdCollection = mongodbClient.collection("traffic_" + trafficId);

  try {
    // Update traffic data in the database
    const updateResult = await trafficIdCollection.updateOne(
      { _id: ObjectId(objectId) },
      {
        $set: {
          lane_direction: trafficData.lane_direction,
          number_of_vehicles: trafficData.number_of_vehicles,
          is_emergency: trafficData.is_emergency,
          timestamp: new Date(),
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

  const mongodbClient = getDB();
  const trafficDataCollection = mongodbClient.collection("traffic_data");

  try {
    // Delete traffic data from the database
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
