"use client";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceComparisonChartProps {
  data: {
    priceHistory: Array<{
      recordedDate: string;
      ourPrice: number;
      marketPrice: number;
      market: { name: string };
    }>;
  };
}

export default function PriceComparisonChart({
  data,
}: PriceComparisonChartProps) {
  const priceHistory = data?.priceHistory || [];

  if (!priceHistory.length) {
    return (
      <div className="h-[300px] flex items-center justify-center text-gray-500">
        No price history data available
      </div>
    );
  }

  const chartData = {
    labels: priceHistory.map((item) =>
      new Date(item.recordedDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Our Price",
        data: priceHistory.map((item) => item.ourPrice),
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
      },
      {
        label: "Market Price",
        data: priceHistory.map((item) => item.marketPrice),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
