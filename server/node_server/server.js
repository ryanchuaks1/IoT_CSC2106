// Import dependencies
const http = require("http");
const WebSocket = require("ws");

// Import user-defined files
const app = require("./src/app");
const { getDB, connectDB, closeDB } = require("./src/services/mongodb");

const port = 5000;

let server;

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

    // Watch for changes in the `trafficdata` collection
    const trafficDataCollection = mongodbClient.collection("traffic_data");
    const trafficDataChangeStream = trafficDataCollection.watch();
    trafficDataChangeStream.on("change", (change) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(change));
        }
      });
    });
    trafficDataChangeStream.on("error", (error) => {
      console.error("Change Stream error:", error);
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
