// frontend/src/components/dashboard/PriceChart.jsx
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const PriceChart = ({ data }) => {
  if (!data?.prices?.length) return null;

  const labels = data.prices.map((p) =>
    new Date(p.date).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
    })
  );

  const closes = data.prices.map((p) => p.close);

  const chartData = {
    labels,
    datasets: [
      {
        label: `${data.symbol} close`,
        data: closes,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        ticks: {
          maxTicksLimit: 6,
          font: { size: 10 },
        },
      },
      y: {
        ticks: {
          font: { size: 10 },
        },
      },
    },
  };

  const lastClose = closes[closes.length - 1];

  return (
    <div className="w-full">
      <div className="h-40">
        <Line data={chartData} options={options} />
      </div>
      <p className="mt-2 text-[11px] text-slate-600">
        Last close:{" "}
        <span className="font-semibold">₹{lastClose.toFixed(2)}</span>
      </p>
    </div>
  );
};

export default PriceChart;
