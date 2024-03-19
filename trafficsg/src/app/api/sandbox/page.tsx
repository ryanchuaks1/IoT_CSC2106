"use client";

// Import React libraries
import React, { useEffect, useState } from "react";
import { Client as MQTTClient } from "paho-mqtt";

// Import user-defined files
import { Endpoint } from "./types";
import { EndpointListItem } from "./Components/EndpointListItem";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;

export default function Sandbox() {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [client, setClient] = useState<MQTTClient | null>(null);

  // Function to fetch traffic data
  const fetchTrafficData = async () => {
    const response = await fetch(`${serverUrl}/api/traffic-data`);
    if (!response.ok) {
      throw new Error("Failed to fetch traffic data");
    }
    return await response.json();
  };

  // Fetch traffic data on component mount
  const loadTrafficData = async () => {
    try {
      const fetchedTrafficData = await fetchTrafficData();
      setTrafficData(fetchedTrafficData);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
    }
  };

  useEffect(() => {
    // Fetch traffic data on component mount
    loadTrafficData();

    // Set up MQTT client
    const mqttClient = new MQTTClient("broker.hivemq.com", 8000, "TrafficSG");

    mqttClient.onConnectionLost = (responseObject) => {
      if (responseObject.errorCode !== 0) {
        console.log("MQTT Connection Lost:", responseObject.errorMessage);
      }
    };

    mqttClient.onMessageArrived = (message) => {
      console.log("MQTT Message Arrived:", message.payloadString);
      loadTrafficData();
    };

    mqttClient.connect({
      onSuccess: () => {
        console.log("Connected to broker");
        mqttClient.subscribe("trafficsg/traffic-data/changes");
      },
    });

    // Set the MQTT Client state
    setClient(mqttClient);

    // Clean up connection on component unmount
    return () => {
      if (mqttClient) {
        mqttClient.disconnect();
      }
    };
  }, []);

  const trafficDataEndpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/traffic-data",
      description: "Get all traffic data",
    },
    {
      method: "GET",
      path: "/api/traffic-data/:traffic_id",
      description: "Get all traffic data for a specific junction",
    },
    {
      method: "POST",
      path: "/api/traffic-data",
      description: "Create a new traffic data",
    },
    {
      method: "PUT",
      path: "/api/traffic-data/:object_id",
      description: "Update a traffic data (Replace `object_id` with `_id`)",
    },
    {
      method: "DELETE",
      path: "/api/traffic-data/:object_id",
      description: "Delete a traffic data (Replace `object_id` with `_id`)",
    },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="container p-4">
        <h1 className="text-xl font-bold m-2">Real-Time Traffic Data (MQTT)</h1>
        {trafficData.length === 0 && (
          <p className="bg-white text-center font-bold p-4">No data available.</p>
        )}
        {trafficData.length > 0 && (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {/* Dynamically generate table headers based on trafficData keys */}
                {Object.keys(trafficData[0]).map((key) => (
                  <th
                    key={key}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Dynamically populate table rows */}
              {trafficData.map((data, idx) => (
                <tr key={idx}>
                  {Object.values(data).map((value: any, valueIdx) => (
                    <td
                      key={valueIdx}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                    >
                      {value.toString()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold m-2">Traffic Data API</h1>
        {trafficDataEndpoints.map((trafficDataEndpoint, index) => (
          <EndpointListItem key={index} {...trafficDataEndpoint} />
        ))}
      </div>
    </main>
  );
}
