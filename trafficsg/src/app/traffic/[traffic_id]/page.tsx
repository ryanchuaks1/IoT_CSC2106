"use client";

// Import React libraries
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Import user-defined files
import Header from "@/components/Header";

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL;
const serverWsUrl =
  process.env.NEXT_PUBLIC_SERVER_WS_URL || "ws://localhost:5000";

export default function TrafficId({
  params,
}: {
  params: { traffic_id: string };
}) {
  const [trafficIdData, setTrafficIdData] = useState<any[]>([]);

  // Function to fetch traffic ID data
  const fetchTrafficIdData = async () => {
    const response = await fetch(
      `${serverUrl}/api/traffic-data/${params.traffic_id}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch traffic data");
    }
    return await response.json();
  };

  // Fetch traffic ID data on component mount
  const loadTrafficIdData = async () => {
    try {
      const fetchedTrafficIdData = await fetchTrafficIdData();
      setTrafficIdData(fetchedTrafficIdData);
    } catch (error) {
      console.error("Error fetching traffic data:", error);
    }
  };

  useEffect(() => {
    loadTrafficIdData();

    // Connect to WebSocket server
    const ws = new WebSocket(serverWsUrl);

    ws.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.onmessage = (event) => {
      console.log("Message from server:", event.data);
      loadTrafficIdData();
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
        <div className="self-start w-full pl-28 my-5">
          <Link href="/traffic" className="p-2 border-2 rounded-md bg-white hover:bg-slate-100">
            ← Back to Traffic Data
          </Link>
        </div>

        <div className="container p-4">
          <h1 className="text-xl font-bold m-2">Real-Time Traffic ID Data</h1>
          {trafficIdData.length === 0 && (
            <p className="bg-white text-center font-bold p-4">
              No data available.
            </p>
          )}
          {trafficIdData.length > 0 && (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Dynamically generate table headers based on trafficData keys */}
                  {Object.keys(trafficIdData[0]).map((key) => (
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
                {trafficIdData.map((data, idx) => (
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
      </div>
    </main>
  );
}
