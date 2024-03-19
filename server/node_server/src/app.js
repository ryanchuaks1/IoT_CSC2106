// Import dependencies
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");

// Import route handlers
const trafficDataRoutes = require("./routes/traffic-data");

// Create an Express application
const app = express();

// Middleware to handle incoming requests
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api/traffic-data", trafficDataRoutes);

module.exports = app;
