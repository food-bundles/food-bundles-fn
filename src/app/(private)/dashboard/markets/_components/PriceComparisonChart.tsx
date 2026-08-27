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

const MARKET_COLORS = [
  { border: "rgb(239, 68, 68)", bg: "rgba(239, 68, 68, 0.1)" },
  { border: "rgb(59, 130, 246)", bg: "rgba(59, 130, 246, 0.1)" },
  { border: "rgb(168, 85, 247)", bg: "rgba(168, 85, 247, 0.1)" },
  { border: "rgb(245, 158, 11)", bg: "rgba(245, 158, 11, 0.1)" },
  { border: "rgb(236, 72, 153)", bg: "rgba(236, 72, 153, 0.1)" },
  { border: "rgb(20, 184, 166)", bg: "rgba(20, 184, 166, 0.1)" },
  { border: "rgb(249, 115, 22)", bg: "rgba(249, 115, 22, 0.1)" },
  { border: "rgb(99, 102, 241)", bg: "rgba(99, 102, 241, 0.1)" },
];

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

  const allDates = Array.from(
    new Set(
      priceHistory.map((item) =>
        new Date(item.recordedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      )
    )
  ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const marketGroups = new Map<
    string,
    Array<{ recordedDate: string; marketPrice: number }>
  >();

  priceHistory.forEach((item) => {
    const date = new Date(item.recordedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const marketName = item.market.name;
    if (!marketGroups.has(marketName)) {
      marketGroups.set(marketName, []);
    }
    marketGroups.get(marketName)!.push({ recordedDate: date, marketPrice: item.marketPrice });
  });

  const ourPriceByDate = new Map<string, number>();
  priceHistory.forEach((item) => {
    const date = new Date(item.recordedDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    ourPriceByDate.set(date, item.ourPrice);
  });

  const datasets: any[] = [
    {
      label: "Our Price",
      data: allDates.map((date) => ourPriceByDate.get(date) ?? null),
      borderColor: "rgb(34, 197, 94)",
      backgroundColor: "rgba(34, 197, 94, 0.1)",
      tension: 0.4,
      spanGaps: true,
    },
  ];

  let colorIndex = 0;
  marketGroups.forEach((entries, marketName) => {
    const color = MARKET_COLORS[colorIndex % MARKET_COLORS.length];
    colorIndex++;

    const priceByDate = new Map(entries.map((e) => [e.recordedDate, e.marketPrice]));

    datasets.push({
      label: marketName,
      data: allDates.map((date) => priceByDate.get(date) ?? null),
      borderColor: color.border,
      backgroundColor: color.bg,
      tension: 0.4,
      spanGaps: true,
      borderDash: undefined,
    });
  });

  const chartData = {
    labels: allDates,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          usePointStyle: true,
          pointStyle: "line",
          padding: 16,
          font: { size: 11 },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  };

  return (
    <div className="h-[300px]">
      <Line data={chartData} options={options} />
    </div>
  );
}
