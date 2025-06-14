import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { Event, OrquestaCount, MonthlyOrquestaCount } from '../types';
import { getRandomColor } from '../utils/helpers';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatisticsProps {
  events: Event[];
}

const Statistics: React.FC<StatisticsProps> = ({ events }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [currentYearData, setCurrentYearData] = useState<OrquestaCount>({});
  const [nextYearData, setNextYearData] = useState<OrquestaCount>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyOrquestaCount>({});

  // Get available years
  const availableYears = [...new Set(events.map(event => new Date(event.day).getFullYear()))].sort((a, b) => b - a);

  useEffect(() => {
    calculateStatistics();
  }, [events, selectedYear]);

  const calculateStatistics = () => {
    const currentOrquestaCount: OrquestaCount = {};
    const nextOrquestaCount: OrquestaCount = {};
    const monthlyOrquestaCount: MonthlyOrquestaCount = {};

    events.forEach(event => {
      if (event.cancelado) return;

      const eventYear = new Date(event.day).getFullYear();
      const month = new Date(event.day).toLocaleDateString('es-ES', { month: 'long' });

      if (eventYear === selectedYear) {
        const orquestas = event.orquesta.split(',').map(orq => orq.trim());
        orquestas.forEach(orq => {
          if (orq === 'DJ') return; // Excluir "DJ"
          
          currentOrquestaCount[orq] = (currentOrquestaCount[orq] || 0) + 1;

          if (!monthlyOrquestaCount[month]) {
            monthlyOrquestaCount[month] = {};
          }
          monthlyOrquestaCount[month][orq] = (monthlyOrquestaCount[month][orq] || 0) + 1;
        });
      }

      if (eventYear === selectedYear + 1) {
        const orquestas = event.orquesta.split(',').map(orq => orq.trim());
        orquestas.forEach(orq => {
          if (orq === 'DJ') return; // Excluir "DJ"
          nextOrquestaCount[orq] = (nextOrquestaCount[orq] || 0) + 1;
        });
      }
    });

    setCurrentYearData(currentOrquestaCount);
    setNextYearData(nextOrquestaCount);
    setMonthlyData(monthlyOrquestaCount);
  };

  const createChartData = (data: OrquestaCount) => {
    const sortedData = Object.entries(data)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15); // Show top 15

    return {
      labels: sortedData.map(([name]) => name),
      datasets: [
        {
          label: 'Número de actuaciones',
          data: sortedData.map(([, count]) => count),
          backgroundColor: sortedData.map(() => getRandomColor()),
          borderColor: 'rgba(0, 0, 0, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'white',
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: 'white',
          padding: 8,
          font: {
            size: 11,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: 'white',
          maxRotation: window.innerWidth < 768 ? 90 : 45,
          minRotation: window.innerWidth < 768 ? 45 : 0,
          padding: 8,
          font: {
            size: window.innerWidth < 768 ? 9 : 11,
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false,
        },
      },
    },
    layout: {
      padding: {
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
  };

  const currentYearChartData = createChartData(currentYearData);
  const nextYearChartData = createChartData(nextYearData);

  // Create monthly table data
  const createMonthlyTableData = () => {
    const allOrquestas = new Set<string>();
    Object.values(monthlyData).forEach(monthOrquestas => {
      Object.keys(monthOrquestas).forEach(orq => allOrquestas.add(orq));
    });

    return Array.from(allOrquestas)
      .map(orquesta => {
        const totalActuaciones = Object.values(monthlyData).reduce(
          (total, monthOrquestas) => total + (monthOrquestas[orquesta] || 0), 
          0
        );
        return { orquesta, total: totalActuaciones };
      })
      .sort((a, b) => b.total - a.total);
  };

  const monthlyTableData = createMonthlyTableData();

  return (
    <div className="space-y-8">
      {/* Year Selection */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-1">
          <div className="flex gap-2 bg-gray-900 rounded-lg p-2">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Year Statistics */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
            <BarChart3 className="w-8 h-8" />
            Estadísticas de Actuaciones {selectedYear}
            <TrendingUp className="w-8 h-8" />
          </h2>
        </div>

        <div className="p-3 md:p-6">
          {Object.keys(currentYearData).length > 0 ? (
            <div className="w-full" style={{ height: 'calc(100vh - 400px)', minHeight: '400px', maxHeight: '600px' }}>
              <Bar data={currentYearChartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center text-gray-400 py-12">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>No hay datos disponibles para {selectedYear}</p>
            </div>
          )}
        </div>
      </div>

      {/* Next Year Statistics */}
      {Object.keys(nextYearData).length > 0 && (
        <div className="bg-gradient-to-br from-purple-900 via-indigo-800 to-purple-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
              <Calendar className="w-8 h-8" />
              Estadísticas {selectedYear + 1}
              <Trophy className="w-8 h-8" />
            </h2>
          </div>

          <div className="p-3 md:p-6">
            <div className="w-full" style={{ height: 'calc(100vh - 400px)', minHeight: '400px', maxHeight: '600px' }}>
              <Bar data={nextYearChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      {/* Monthly Tables */}
      {monthlyTableData.length > 0 && (
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8" />
              Tabla de Actuaciones {selectedYear}
              <BarChart3 className="w-8 h-8" />
            </h2>
          </div>

          <div className="p-6 overflow-x-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    <th className="px-6 py-4 text-left font-bold">FORMACIÓN/SOLISTA</th>
                    <th className="px-6 py-4 text-center font-bold">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTableData.map((item, index) => (
                    <tr 
                      key={item.orquesta} 
                      className={`${
                        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 text-gray-800 font-medium">
                        {item.orquesta}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold">
                          {item.total}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Statistics;
