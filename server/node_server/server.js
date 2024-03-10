const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://root:password@mongodb:27017/mongo_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&retryWrites=true&ssl=false';

const app = express();
const port = 5000;

app.use(bodyParser.json());

let db;

const connectDB = async () => {
  try {
    const client = await MongoClient.connect(MONGO_URI, { useNewUrlParser: true });
    db = client.db();
    console.log('Connected to MongoDB successfully!');
  } catch (error) {
    console.error('Could not connect to MongoDB:', error);
  }
};

const closeDB = () => {
  if (db) {
    db.close();
    console.log('Closed MongoDB connection.');
  }
};

// Routes (Traffic Data)

// Get all traffic data
app.get('/api/traffic-data', async (req, res) => {
  const trafficDataCollection = db.collection('trafficdata');

  try {
    const allTrafficData = await trafficDataCollection.find().toArray();

    res.status(200).json(allTrafficData);
  } catch (error) {
    console.error('Error getting all traffic data:', error);
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

// Add traffic data
app.post('/api/traffic-data', async (req, res) => {
  let trafficData = req.body.traffic_data;
  const trafficDataCollection = db.collection('trafficdata');

  // Check if trafficData is an array or a single object
  if (!Array.isArray(trafficData)) {
    trafficData = [trafficData];
  }

  try {
    const result = await trafficDataCollection.insertMany(trafficData);
    res.status(201).json({ result: true, message: 'Traffic data added successfully!' });
  } catch (error) {
    console.error('Error adding traffic data:', error);
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

// Get traffic data by `traffic_id`
app.get('/api/traffic-data/:traffic_id', async (req, res) => {
  const trafficId = req.params.traffic_id;
  const trafficDataCollection = db.collection('trafficdata');

  try {
    let query = {};

    if (trafficId) {
      query = { traffic_id: trafficId };
    }

    const allTrafficData = await trafficDataCollection.find(query).toArray();

    if (allTrafficData.length > 0) {
      res.status(200).json(allTrafficData);
    } else {
      res.status(404).json({ result: false, message: 'Traffic data not found' });
    }
  } catch (error) {
    console.error('Error getting traffic data:', error);
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

// Update traffic data by `object_id`
app.put('/api/traffic-data/:object_id', async (req, res) => {
  const objectId = req.params.object_id;
  const trafficData = req.body.traffic_data;
  const trafficDataCollection = db.collection('trafficdata');

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

    res.status(201).json({ result: true, message: 'Traffic data updated successfully!' });
  } catch (error) {
    console.error('Error updating traffic data:', error);
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

// Delete traffic data by `object_id`
app.delete('/api/traffic-data/:object_id', async (req, res) => {
  const objectId = req.params.object_id;
  const trafficDataCollection = db.collection('trafficdata');

  try {
    const deleteResult = await trafficDataCollection.deleteOne({ _id: ObjectId(objectId) });
    res.status(201).json({ result: true, message: 'Traffic data deleted successfully!' });
  } catch (error) {
    console.error('Error deleting traffic data:', error);
    res.status(500).json({ result: false, message: 'Internal server error' });
  }
});

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
});

process.on('SIGINT', () => {
  closeDB();
  process.exit();
});
