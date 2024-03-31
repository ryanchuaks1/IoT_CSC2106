// Import React libraries
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LineChartProps {
    header: string,
    chartWidth?: string,
    data: any;
}

const LineChart = ({ header, data, chartWidth }: LineChartProps) => {
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
        <div className={`m-4 p-1 border border-primary flex-auto ${chartWidth}`}>
            <Line data={data} options={options} />
        </div>
    );
};

export default LineChart;
