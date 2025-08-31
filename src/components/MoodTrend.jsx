import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const MoodTrend = ({ data = null, height = 250 }) => {
  // Default options for the chart
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        ticks: {
          stepSize: 1,
          callback: (value) => {
            if (value === 0) return '';
            if (value === 1) return 'Poor';
            if (value === 3) return 'Neutral';
            if (value === 5) return 'Excellent';
            return '';
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 4,
        hoverRadius: 6,
      },
    },
  };

  // Default data if none provided
  const defaultData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Mood',
        data: [3, 4, 3, 5, 4, 3, 4],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
      },
      {
        label: 'Energy',
        data: [2, 3, 4, 4, 3, 4, 5],
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
      },
    ],
  };

  // Use provided data or default
  const chartData = data || defaultData;

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" gutterBottom>
        Mood & Energy Trend
      </Typography>
      <Box sx={{ height }}>
        <Line data={chartData} options={options} height={height} />
      </Box>
    </Paper>
  );
};

export default MoodTrend;

