"use client";

import { Endpoint } from "./types";
import { EndpointListItem } from "./Components/EndpointListItem";

export default function Sandbox() {

  const trafficDataEndpoints: Endpoint[] = [
    {
      method: "GET",
      path: "/api/traffic-data",
      description: "Get all traffic data",
      html: (
        <div>
          Replace here.
        </div>
      ),
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
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="container mx-auto p-4">
        <h1 className="text-xl font-bold m-2">Traffic Data API</h1>
        {trafficDataEndpoints.map((trafficDataEndpoint, index) => (
          <EndpointListItem key={index} {...trafficDataEndpoint} />
        ))}
      </div>
    </main>
  );
}
