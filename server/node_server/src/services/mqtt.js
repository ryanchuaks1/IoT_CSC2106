// MQTT Client
const mqtt = require('mqtt');
const MQTT_BROKER_URI = 'mqtt://broker.hivemq.com';

const mqttClient = mqtt.connect(MQTT_BROKER_URI);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
});

mqttClient.on('error', (error) => {
  console.error('Connection to MQTT broker failed:', error);
});

module.exports = mqttClient;