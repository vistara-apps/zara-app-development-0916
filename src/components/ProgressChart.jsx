import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ProgressChart = ({ 
  data, 
  title = 'Fasting Progress', 
  type = 'bar', 
  height = 300,
  showLegend = true
}) => {
  // Default options for charts
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
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
  };

  // Render appropriate chart based on type
  const renderChart = () => {
    if (!data || !data.labels || !data.datasets) {
      return (
        <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            No data available
          </Typography>
        </Box>
      );
    }

    switch (type) {
      case 'line':
        return <Line data={data} options={options} height={height} />;
      case 'bar':
      default:
        return <Bar data={data} options={options} height={height} />;
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, borderRadius: 4 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Box sx={{ height }}>
        {renderChart()}
      </Box>
    </Paper>
  );
};

export default ProgressChart;

