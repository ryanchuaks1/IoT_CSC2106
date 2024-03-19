"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Endpoint } from "../api/sandbox/types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Must have equal amount of query and data_points
export default function Barchart({
  header,
  dataPoints,
  dataDescription,
  endpoint,
  chartWidth,
}: {
  header: string;
  dataPoints: string[];
  dataDescription: string[];
  chartWidth?: string;
  endpoint?: Endpoint[];
}) {
  const getRandomNumber = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: header,
      },
    },
  };

  if (endpoint) {
    // TODO
  }

  const datasets = [];
  for (let i = 0; i < dataDescription.length; i++) {
    datasets.push({
      label: dataDescription[i],
      data: dataPoints.map(() => getRandomNumber(0, 1000)),
      backgroundColor: `rgba(${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)}, ${getRandomNumber(0, 255)}, 0.5)`,
    });
  }
  
  const labels = dataPoints; // Assuming dataPoints is defined somewhere
  const data = {
    labels,
    datasets,
  };


  return (
    <div className={`m-4 p-1 border border-primary flex-auto ${chartWidth}`}>
      <Bar className="w-full" options={options} data={data} />
    </div>
  );
}
