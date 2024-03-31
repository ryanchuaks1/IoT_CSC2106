"use client";

// Import React libraries
import { useState, useEffect } from "react";

// Import user-defined files
import Header from "@/components/Header";
import Barchart from "@/components/Barchart";
import LineChart from "@/components/Linechart";

export default function Home() {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
  const serverWsUrl =
    process.env.NEXT_PUBLIC_SERVER_WS_URL || "ws://localhost:5000";

  // Global state to store traffic collection data
  const [trafficCollectionData, setTrafficCollectionData] = useState<any>([]);

  // States for number-of-vehicles line chart (novLc) data - default values
  const [novLcFilterTrafficId, setnovLcFilterTrafficId] = useState<number>(-1);
  const [novLcFilterTimeInterval, setnovLcFilterTimeInterval] = useState<number>(0);
  const [novLcFilterLaneDirection, setnovLcFilterLaneDirection] = useState<string>("");
  const [novLcData, setNovLcData] = useState<{ labels: String[], datasets: any[]; }>({ labels: [], datasets: [] });

  // Function to fetch traffic data
  const fetchTrafficData = async () => {
    const response = await fetch(`${serverUrl}/api/traffic-data`);
    if (!response.ok) {
      throw new Error("Failed to fetch traffic data");
    }
    return await response.json();
  };

  // Function to fetch individual traffic collection by ID
  const fetchTrafficCollection = async (id: Number) => {
    const response = await fetch(`${serverUrl}/api/traffic-data/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch traffic data for ID ${id}`);
    }
    return await response.json();
  };

  // Function to fetch and process traffic data for the line chart
  const loadAndProcessTrafficData = async () => {
    try {
      const trafficDatas = await fetchTrafficData();
      const trafficCollectionPromises = trafficDatas.map((trafficData: any) =>
        fetchTrafficCollection(trafficData.traffic_id)
      );
      let trafficCollectionResults = await Promise.all(
        trafficCollectionPromises
      );

      // Flatten the array of arrays into a single array of objects
      trafficCollectionResults = trafficCollectionResults.flat().sort((a: any, b: any) => a.timestamp - b.timestamp);
      setTrafficCollectionData(trafficCollectionResults);

      // Process the data for each chart/data visualization
      processNovLcData(trafficCollectionResults);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
    }
  };

  // Process the data for number-of-vehicles line chart
  const processNovLcData = (trafficCollectionResults: any) => {
    // Filter the traffic data based on the selected filter criteria
    let filteredTrafficData = trafficCollectionResults.filter(
      (trafficData: any) => {
        return (
          (novLcFilterTrafficId === -1 ||
            trafficData.traffic_id === novLcFilterTrafficId) &&
          (novLcFilterLaneDirection === "" ||
            trafficData.lane_direction === novLcFilterLaneDirection)
        );
      }
    );

    // Function to group the records by the given interval in hours
    const groupByTimeInterval = (data: any[], interval: number) => {
      const groups: { [key: string]: any[] } = {};

      data.forEach((item) => {
        // Parse the timestamp and round it down to the nearest interval
        const date = new Date(item.timestamp);
        const roundedDate = new Date(
          Math.floor(date.getTime() / (interval * 60 * 60 * 1000)) *
            (interval * 60 * 60 * 1000)
        );

        // Use toISOString to create a consistent group key
        const key = roundedDate.toISOString();

        if (!groups[key]) {
          groups[key] = [];
        }

        groups[key].push(item);
      });

      return Object.keys(groups).map((key) => {
        return {
          time: key,
          number_of_vehicles: groups[key].reduce(
            (sum, current) => sum + current.number_of_vehicles,
            0
          ),
        };
      });
    };

    // `timeIntervalMap` = [no filter, 1h, 3h, 5h, 12h, daily, weekly, monthly]
    const timeIntervalMap = [0, 1, 3, 5, 12, 24, 24 * 7, 24 * 30]; 
    const interval = timeIntervalMap[novLcFilterTimeInterval] || 0;

    // Group and sum the data if there is a time interval filter
    let groupedData =
      interval > 0
        ? groupByTimeInterval(filteredTrafficData, interval)
        : filteredTrafficData;

    // Sort the groups by time and take the last 20 records
    groupedData = groupedData
      .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime())
      .slice(-20);

    // Prepare the data for the chart
    const data = {
      labels: groupedData.map((g: { timestamp: any; }) => g.timestamp),
      datasets: [{
        label: 'Number of vehicles',
        data: groupedData.map((g: { number_of_vehicles: any; }) => g.number_of_vehicles),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        fill: false,
      }]
    };

    console.log("FICL");
    console.log(data);
    console.log("COle");

    setNovLcData(data);
  };

  useEffect(() => {
    loadAndProcessTrafficData();

    // Connect to WebSocket server
    const ws = new WebSocket(serverWsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      loadAndProcessTrafficData();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    return () => {
      ws.close();
    };
  });

  return (
    <div className="min-h-screen min-w-screen bg-white w-">
      <Header />
      <div className="p-4">
        {/* Filter UI for the number-of-vehicles line chart */}
        <div className="flex justify-around p-4">
          <div>
            <span className="font-bold">Traffic ID: </span>
            <select
              value={novLcFilterTrafficId}
              onChange={(e) => setnovLcFilterTrafficId(Number(e.target.value))}
            >
              <option value="-1">All</option>

              {Array.from(new Set(trafficCollectionData.map((trafficData: any) => trafficData.traffic_id as number)))
                .sort((a: any, b: any) => a - b)
                .map((id: any) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <span className="font-bold">Time Interval: </span>
            <select
              value={novLcFilterTimeInterval}
              onChange={(e) => setnovLcFilterTimeInterval(Number(e.target.value))}
            >
              <option value="0">No Filter</option>
              <option value="1">1 Hour</option>
              <option value="2">3 Hours</option>
              <option value="3">5 Hours</option>
              <option value="4">12 Hours</option>
              <option value="5">Daily</option>
              <option value="6">Weekly</option>
              <option value="7">Monthly</option>
            </select>
          </div>

          <div>
            <span className="font-bold">Lane Direction: </span>
            <select
              value={novLcFilterLaneDirection}
              onChange={(e) => setnovLcFilterLaneDirection(e.target.value)}
            >
              <option value="">All Directions</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>
        </div>

        <LineChart
          header={"Number of vehicles over time"}
          chartWidth="w-max-content lg:w-1/2"
          data={novLcData}
        />
      </div>
    </div>
  );
}
