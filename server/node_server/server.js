// Import dependencies
const app = require("./src/app");
const { connectDB, closeDB } = require("./src/services/mongodb");

const port = 5000;

// Connect to MongoDB and start the server
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

process.on("SIGINT", () => {
  closeDB();
  process.exit();
});
