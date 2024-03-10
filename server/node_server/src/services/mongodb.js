// MongoDB Client
const { MongoClient } = require("mongodb");

const MONGO_URI = "mongodb://root:password@mongodb:27017/mongo_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false";

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI, {
      useNewUrlParser: true,
    });
    db = client.db();
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Could not connect to MongoDB:", error);
  }
};

const getDB = () => db;

const closeDB = () => {
  if (db) {
    db.close();
    console.log("Closed MongoDB connection.");
  }
};

module.exports = { connectDB, getDB, closeDB };
