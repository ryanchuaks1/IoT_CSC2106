// Import dependencies
const http = require("http");
const WebSocket = require("ws");

// Import user-defined files
const app = require("./src/app");
const { getDB, connectDB, closeDB } = require("./src/services/mongodb");

const port = 5000;
let server;

// Function to setup change streams for a given collection
function setupChangeStreamForCollection(mongodbClient, wss, collectionName) {
  const collection = mongodbClient.collection(collectionName);
  const changeStream = collection.watch();

  changeStream.on("change", (change) => {
    console.log(`Change detected in collection ${collectionName}:`, change);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ collectionName, change }));
      }
    });
  });

  changeStream.on("error", (error) => {
    console.error(`Change Stream error in ${collectionName}:`, error);
  });
}

// Connect to MongoDB and start the server
connectDB()
  .then(() => {
    // Create a HTTP server from the Express app
    server = http.createServer(app);

    // Attach WebSocket server to the same HTTP server
    const wss = new WebSocket.Server({ server });

    // WebSocket server event listener
    wss.on("connection", (ws) => {
      console.log("A new client connected!");
      ws.on("message", (message) => {
        console.log(`Received message => ${message}`);
      });
      ws.send("Message from the server.");
    });

    // Get the MongoDB client
    const mongodbClient = getDB();

    // Setup change stream for the `traffic_data` collection
    setupChangeStreamForCollection(mongodbClient, wss, "traffic_data");

    // Function to setup initial change streams for existing `traffic_id` collections
    async function setupInitialChangeStreams() {
      const trafficDataCollection = mongodbClient.collection("traffic_data");
      const trafficIds = await trafficDataCollection.distinct("traffic_id");

      trafficIds.forEach((trafficId) => {
        setupChangeStreamForCollection(
          mongodbClient,
          wss,
          `traffic_${trafficId}`
        );
      });
    }

    // Call the function to setup initial change streams
    setupInitialChangeStreams().then(() => {
      console.log("Initial change streams setup complete.");
    });

    server.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch(console.error);

process.on("SIGINT", () => {
  closeDB();
  if (server) {
    server.close(() => {
      console.log("HTTP Server closed.");
    });
  }
  process.exit();
});
