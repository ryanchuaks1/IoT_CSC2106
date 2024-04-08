import React from "react";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Pie } from "react-chartjs-2";

// Register the necessary Chart.js components for a Pie chart
ChartJS.register(Tooltip, Legend, ArcElement);

const PieChart: React.FC<any> = ({ header, labels, data, chartWidth }) => {
  const chartData: ChartData<"pie"> = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#F7464A",
          "#46BFBD",
          "#FDB45C",
          "#949FB1",
          "#4D5360",
        ],
        hoverOffset: 4,
      },
    ],
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

  return (
    <div className={`m-4 p-1 border border-slate-200 flex-auto ${chartWidth}`}>
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
