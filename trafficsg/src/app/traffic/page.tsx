"use client";

// Import React libraries
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Import user-defined files
import Header from "@/components/Header";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const serverWsUrl =
  process.env.NEXT_PUBLIC_SERVER_WS_URL || "ws://localhost:5000";

export default function Traffic() {
  const [trafficData, setTrafficData] = useState<any[]>([]);

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
    loadTrafficData();

    // Connect to WebSocket server
    const ws = new WebSocket(serverWsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      loadTrafficData();
    };

    ws.onerror = (error) => {
      console.error("WebSocket error: ", error);
    };

    return () => {
      ws.close();
    };
  });
  return (
    <main className="min-h-screen min-w-screen">
      <Header />
      <div className="flex flex-col items-center p-24 pt-5">
        <div className="container p-4">
          <h1 className="text-xl font-bold m-2">Real-Time Traffic Data</h1>
          {trafficData.length === 0 && (
            <p className="bg-white text-center font-bold p-4">
              No data available.
            </p>
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
                {trafficData.map((data, idx) => (
                  <tr key={idx}>
                    {Object.entries(data).map(
                      ([key, value]: [string, unknown], valueIdx) => (
                        <td
                          key={valueIdx}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {key === "traffic_id" ? (
                            <Link
                              href={`/traffic/${value}`}
                              className="text-blue-400 underline hover:text-blue-500"
                            >
                              {(value as string).toString()}
                            </Link>
                          ) : (
                            (value as string).toString()
                          )}
                        </td>
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}
