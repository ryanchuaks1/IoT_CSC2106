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

  // States for avgNovInWeek, avgNovInDay, avgNovInHour - default values
  const [avgNovInHour, setAvgNovInHour] = useState<number>(0);
  const [avgNovInDay, setAvgNovInDay] = useState<number>(0);
  const [avgNovInWeek, setAvgNovInWeek] = useState<number>(0);

  // States for number-of-vehicles line chart (novLc) data - default values
  const [novLcFilterTrafficId, setnovLcFilterTrafficId] = useState<number>(-1);
  const [novLcFilterTimeInterval, setNovLcFilterTimeInterval] = useState<number>(0);
  const [novLcFilterLaneDirection, setNovLcFilterLaneDirection] = useState<string>("");
  const [novLcData, setNovLcData] = useState<{ labels: String[]; datasets: any[]; }>({ labels: [], datasets: [] });
  const [novLdLcData, setNovLdLcData] = useState<{ labels: String[]; datasets: any[]; }>({ labels: [], datasets: [] });

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
      // and sort by ascending timestamp
      trafficCollectionResults = trafficCollectionResults
        .flat()
        .sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      setTrafficCollectionData(trafficCollectionResults);

      // Process the data for each chart/data visualization
      processNovLcData(trafficCollectionResults);
      processNovLdLcData(trafficCollectionResults);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
    }
  };

  // Process the data for number-of-vehicles line chart
  const processNovLcData = (trafficCollectionResults: any) => {
    // Filter the data based on the traffic ID
    trafficCollectionResults = trafficCollectionResults.filter((item: any) => {
      if (novLcFilterTrafficId === -1) {
        return true;
      }
      return item.traffic_id == novLcFilterTrafficId;
    });

    // Filter the data based on the lane direction
    trafficCollectionResults = trafficCollectionResults.filter((item: any) => {
      if (novLcFilterLaneDirection === "") {
        return true;
      }
      return item.lane_direction == novLcFilterLaneDirection;
    });

    // Filter the traffic data based on the selected filter criteria
    const groupByTimeInterval = (data: any[], interval: number): any[] => {
      const groups: { [key: string]: any } = {};

      data.forEach((item) => {
        // Create a date object from the timestamp
        const date = new Date(item.timestamp);

        // Depending on the interval, adjust the date
        if (interval === 1) {
          date.setMinutes(0, 0, 0);
        }

        // Use toISOString to create a consistent group key
        const key = date.toISOString();

        if (!groups[key]) {
          groups[key] = { number_of_vehicles: 0, timestamp: key };
        }

        groups[key].number_of_vehicles += item.number_of_vehicles;
      });

      // Convert the grouped object back to an array
      return Object.keys(groups).map((key) => groups[key]);
    };

    // `timeIntervalMap` = [no filter, 1h, 3h, 5h, 12h, daily, weekly, monthly]
    const timeIntervalMap: number[] = [0, 1, 3, 5, 12, 24, 24 * 7, 24 * 30];
    const interval = timeIntervalMap[novLcFilterTimeInterval] || 0;

    // Declare and assign the variable filteredTrafficData
    const filteredTrafficData = trafficCollectionResults;

    // Group and sum the data if there is a time interval filter
    let groupedData = groupByTimeInterval(filteredTrafficData, interval);

    // Sort the groups by time and take the last 20 records
    groupedData = groupedData
      .sort(
        (a: any, b: any) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
      )
      .slice(-20);

    // Prepare the data for the chart
    const data = {
      labels: groupedData.map((g: any) => {
        const date = new Date(g.timestamp);
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }),
      datasets: [
        {
          label: "Number of vehicles",
          data: groupedData.map(
            (g: { number_of_vehicles: any }) => g.number_of_vehicles
          ),
          borderColor: "rgb(200, 200, 200)",
          backgroundColor: "rgb(200, 200, 200)",
          tension: 0.1,
          fill: false,
        },
      ],
    };

    setNovLcData(data);
  };

  // Process the data for number-of-vehicles (lane-direction) line chart
  const processNovLdLcData = (trafficCollectionResults: any) => {
    // Filter the data based on the traffic ID
    trafficCollectionResults = trafficCollectionResults.filter((item: any) => {
      if (novLcFilterTrafficId === -1) {
        return true;
      }
      return item.traffic_id == novLcFilterTrafficId;
    });

    // Filter the data based on the lane direction
    trafficCollectionResults = trafficCollectionResults.filter((item: any) => {
      if (novLcFilterLaneDirection === "") {
        return true;
      }
      return item.lane_direction == novLcFilterLaneDirection;
    });

    // Group the traffic data by direction
    const directions = ["north", "south", "east", "west"];

    // Initialize an object to hold datasets for each direction
    const datasetsForDirections = directions.reduce((acc: any, direction) => {
      acc[direction] = {
        label: `Number of vehicles (${direction})`,
        data: [],
        borderColor: "", // add specific color for each direction
        tension: 0.1,
        fill: false,
      };
      return acc;
    }, {});

    // You can define different colors for each direction if needed
    const directionColors: any = {
      north: "rgb(255, 99, 132)",
      south: "rgb(54, 162, 235)",
      east: "rgb(255, 206, 86)",
      west: "rgb(75, 192, 192)",
    };

    // Filter and group data by time interval and direction
    const groupByTimeIntervalAndDirection = (data: any[], interval: number) => {
      const groups: { [key: string]: any } = {};

      data.forEach((item) => {
        // Only process if direction is one of the known directions
        if (directions.includes(item.lane_direction)) {
          const date = new Date(item.timestamp);
          if (interval === 1) {
            date.setMinutes(0, 0, 0);
          }
          const key = date.toISOString() + `_${item.lane_direction}`;

          if (!groups[key]) {
            groups[key] = {
              number_of_vehicles: 0,
              timestamp: date.toISOString(),
              lane_direction: item.lane_direction,
            };
          }

          groups[key].number_of_vehicles += item.number_of_vehicles;
        }
      });

      // Make sure to initialize the accumulator object with properties for each direction
      const initialAccumulator = {
        north: [],
        south: [],
        east: [],
        west: [],
      };

      // Convert the grouped object back to an array and separate by direction
      return Object.keys(groups).reduce((acc: any, key) => {
        const group = groups[key];
        if (acc[group.lane_direction]) {
          acc[group.lane_direction].push(group);
        }
        return acc;
      }, initialAccumulator);
    };

    const sortGroupsByTime = (dataset: any) => {
      for (const direction of directions) {
        dataset[direction].sort(
          (a: any, b: any) =>
            new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
    };

    // `timeIntervalMap` = [no filter, 1h, 3h, 5h, 12h, daily, weekly, monthly]
    const timeIntervalMap: number[] = [0, 1, 3, 5, 12, 24, 24 * 7, 24 * 30];
    const interval = timeIntervalMap[novLcFilterTimeInterval] || 0;
    let groupedDataByDirection = groupByTimeIntervalAndDirection(
      trafficCollectionResults,
      interval
    );

    sortGroupsByTime(groupedDataByDirection);

    // Prepare the datasets
    for (const direction of directions) {
      const groupedData = groupedDataByDirection[direction].slice(-20); // take the last 20 records
      datasetsForDirections[direction] = groupedData.map(
        (g: any) => g.number_of_vehicles
      );
    }

    // Prepare the labels for the chart (use the timestamps from one direction, assuming all have the same intervals)
    let selectedgroupedDataByDirection;
    for (let direction of directions) {
      if (groupedDataByDirection[direction].length > 0) {
        selectedgroupedDataByDirection = groupedDataByDirection[direction];
        break;
      }
    }

    const labels = selectedgroupedDataByDirection
      .slice(-20)
      .map((g: any) => {
        const date = new Date(g.timestamp);
        return date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      });

    // Prepare the final data object for the chart
    const data = {
      labels,
      datasets: Object.entries(datasetsForDirections).map(([direction, dataset]) => {
        return {
          // Label as key for the dataset
          label: `${direction.charAt(0).toUpperCase() + direction.slice(1)}`,
          data: dataset,
          borderColor: directionColors[direction],
          backgroundColor: directionColors[direction],
          tension: 0.1,
          fill: false,
        };
      }),
    };

    setNovLdLcData(data);
  };

  // Adjusts average cars in last hour, day, week whenever trafficCollectionData changes
  useEffect(() => {
    // Filter trafficCollectionData to get the last hour, day, week
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const trafficDataInHour = trafficCollectionData.filter(
      (item: any) => new Date(item.timestamp) > oneHourAgo
    );
    const trafficDataInDay = trafficCollectionData.filter(
      (item: any) => new Date(item.timestamp) > oneDayAgo
    );
    const trafficDataInWeek = trafficCollectionData.filter(
      (item: any) => new Date(item.timestamp) > oneWeekAgo
    );

    // Sums the number of vehicles in the last hour, day, week
    const sumInHour = trafficDataInHour.reduce(
      (acc: number, item: any) => acc + item.number_of_vehicles,
      0
    );
    const sumInDay = trafficDataInDay.reduce(
      (acc: number, item: any) => acc + item.number_of_vehicles,
      0
    );
    const sumInWeek = trafficDataInWeek.reduce(
      (acc: number, item: any) => acc + item.number_of_vehicles,
      0
    );

    // Calculate the average number of vehicles per lane direction
    const avgInHour = sumInHour / 4 || 0;
    const avgInDay = sumInDay / 4 || 0;
    const avgInWeek = sumInWeek / 4 || 0;

    // Update the state variables
    setAvgNovInHour(avgInHour);
    setAvgNovInDay(avgInDay);
    setAvgNovInWeek(avgInWeek);
  }, [trafficCollectionData]);

  // Load and process traffic data whenever filter criteria and traffic collection data changes
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
  }, [novLcFilterTrafficId, novLcFilterTimeInterval, novLcFilterLaneDirection]);

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

              {Array.from(
                new Set(
                  trafficCollectionData.map(
                    (trafficData: any) => trafficData.traffic_id as number
                  )
                )
              )
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
              onChange={(e) =>
                setNovLcFilterTimeInterval(Number(e.target.value))
              }
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
              onChange={(e) => setNovLcFilterLaneDirection(e.target.value)}
            >
              <option value="">All Directions</option>
              <option value="north">North</option>
              <option value="south">South</option>
              <option value="east">East</option>
              <option value="west">West</option>
            </select>
          </div>
        </div>

        <div className="flex justify-around px-4">
          <div
            className={`m-4 text-sm border border-slate-200 flex-auto w-max-content lg:w-1/3 py-2 p-5`}
          >
            <span className="text-xs font-semibold text-slate-600">
              Average cars in past hour
            </span>
            <div className="text-4xl w-max-content text-center font-bold pt-2">
              {avgNovInHour}
            </div>
            <div className="w-max-content text-center">Number of Vehicles</div>
          </div>
          <div
            className={`m-4 text-sm border border-slate-200 flex-auto w-max-content lg:w-1/3 py-2 p-5`}
          >
            <span className="text-xs font-semibold text-slate-600">
              Average cars in last 1 days
            </span>
            <div className="text-4xl w-max-content text-center font-bold pt-2">
              {avgNovInDay}
            </div>
            <div className="w-max-content text-center">Number of Vehicles</div>
          </div>
          <div
            className={`m-4 border border-slate-200 flex-auto w-max-content lg:w-1/3 py-2 p-5`}
          >
            <span className="text-xs font-semibold text-slate-600">
              Average cars in last 7 days
            </span>
            <div className="text-4xl w-max-content text-center font-bold pt-2">
              {avgNovInWeek}
            </div>
            <div className="w-max-content text-center">Number of Vehicles</div>
          </div>
        </div>

        <div className="flex justify-around px-4">
          <LineChart
            header={"Total number of vehicles over time"}
            chartWidth="w-max-content lg:w-1/2"
            data={novLcData}
          />

          <LineChart
            header={"Total number of vehicles per lane direction"}
            chartWidth="w-max-content lg:w-1/2"
            data={novLdLcData}
          />

          {/* <Barchart
            header={"Traffic I/O by time of day"}
            dataPoints={["Morning", "Afternoon", "Evening", "Night"]}
            dataDescription={["Traffic ID 1", "Traffic ID 2"]}
            chartWidth="w-max-content lg:w-1/2"
          /> */}
        </div>
      </div>
    </div>
  );
}
