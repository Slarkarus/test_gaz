import React from 'react';
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
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const MeasurementChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 40, 
        color: '#6c757d',
        border: '2px dashed #dee2e6',
        borderRadius: 8
      }}>
        Нет данных для отображения
      </div>
    );
  }

  const chartData = {
    datasets: [
      {
        label: data[0].measurement,
        data: data.map(item => ({
          x: new Date(item.timestamp),
          y: item.value,
        })),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.1,
      }
    ]
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          tooltipFormat: 'PPpp',
        },
        title: {
          display: true,
          text: 'Время'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Значение'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: `График измерения: ${data[0].measurement}`
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `Значение: ${context.parsed.y.toFixed(2)}`;
          },
          title: (context) => {
            return new Date(context[0].parsed.x).toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div style={{ 
      marginTop: 30, 
      padding: 20,
      border: '1px solid #e0e0e0',
      borderRadius: 8,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)'
    }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default MeasurementChart;