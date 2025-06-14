import React, { useState, useEffect, useMemo } from 'react';
import { Event } from '../types';
import { Calendar, BarChart3, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

// Hook para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setScreenSize('mobile');
      } else if (width < 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return screenSize;
};

interface StatsTablesProps {
  events: Event[];
}

interface MonthlyStats {
  [month: string]: {
    [orquesta: string]: number;
  };
}

interface TotalStats {
  [orquesta: string]: number;
}

const StatsTablesMini: React.FC<StatsTablesProps> = ({ events }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const screenSize = useScreenSize();

  // Determinar cuántas orquestas mostrar según el tamaño de pantalla
  const getMaxOrquestas = () => {
    switch (screenSize) {
      case 'mobile': return 6;
      case 'tablet': return 8;
      case 'desktop': return 12;
      default: return 10;
    }
  };

  // Determinar cuántas orquestas mostrar por mes según el tamaño de pantalla
  const getMaxOrquestasPorMes = () => {
    switch (screenSize) {
      case 'mobile': return 2;
      case 'tablet': return 3;
      case 'desktop': return 4;
      default: return 3;
    }
  };

  // Get available years
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    events.forEach(event => {
      if (!event.cancelado) {
        const year = new Date(event.day).getFullYear();
        years.add(year);
      }
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [events]);

  // Calculate monthly stats
  const monthlyStats = useMemo(() => {
    const stats: MonthlyStats = {};
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];

    events.forEach(event => {
      if (!event.cancelado) {
        const eventYear = new Date(event.day).getFullYear();
        if (eventYear === selectedYear) {
          const month = new Date(event.day).toLocaleDateString('es-ES', { month: 'long' });
          const orquestas = event.orquesta.split(',').map(orq => orq.trim());
          
          orquestas.forEach(orq => {
            if (orq && orq !== 'DJ') {
              if (!stats[month]) {
                stats[month] = {};
              }
              if (!stats[month][orq]) {
                stats[month][orq] = 0;
              }
              stats[month][orq]++;
            }
          });
        }
      }
    });

    // Sort months chronologically
    const sortedStats: MonthlyStats = {};
    monthNames.forEach(month => {
      if (stats[month]) {
        sortedStats[month] = stats[month];
      }
    });

    return sortedStats;
  }, [events, selectedYear]);

  // Calculate total stats
  const totalStats = useMemo(() => {
    const stats: TotalStats = {};

    events.forEach(event => {
      if (!event.cancelado) {
        const eventYear = new Date(event.day).getFullYear();
        if (eventYear === selectedYear) {
          const orquestas = event.orquesta.split(',').map(orq => orq.trim());
          
          orquestas.forEach(orq => {
            if (orq && orq !== 'DJ') {
              if (!stats[orq]) {
                stats[orq] = 0;
              }
              stats[orq]++;
            }
          });
        }
      }
    });

    return stats;
  }, [events, selectedYear]);

  const sortedTotalStats = useMemo(() => {
    return Object.entries(totalStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, getMaxOrquestas()); // Show based on screen size
  }, [totalStats, screenSize]);

  if (availableYears.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div 
        className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 cursor-pointer hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3">
            <BarChart3 className="w-6 h-6" />
            Estadísticas de Actuaciones
            <TrendingUp className="w-6 h-6" />
          </h2>
          {isExpanded ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Year Selector */}
          <div className="flex flex-wrap gap-2 justify-center">
            {availableYears.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`${screenSize === 'mobile' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} rounded-lg font-medium transition-all duration-300 ${
                  selectedYear === year
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                {year}
              </button>
            ))}
          </div>

          <div className={`grid gap-6 ${screenSize === 'mobile' ? 'grid-cols-1' : screenSize === 'tablet' ? 'grid-cols-1 lg:grid-cols-2' : 'lg:grid-cols-2'}`}>
            {/* Top Actuaciones */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4 text-yellow-400 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Top Actuaciones {selectedYear}
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto overflow-x-hidden">
                {sortedTotalStats.map(([orquesta, count], index) => (
                  <div key={orquesta} className={`bg-gray-700/30 rounded-lg p-3 min-w-0 w-full ${screenSize === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                    {/* Ranking y número */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`${screenSize === 'mobile' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-xs'} rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-black' :
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-gray-600 text-white'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="text-gray-400 text-xs">#{index + 1}</span>
                      </div>
                      <span className="text-blue-400 font-bold text-lg flex-shrink-0">{count}</span>
                    </div>
                    
                    {/* Nombre de orquesta en línea separada */}
                    <div className="w-full min-w-0">
                      <div className={`font-medium orchestra-names-container ${screenSize === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                        {orquesta.split(',').map((orq, orqIndex, arr) => (
                          <span key={orqIndex} className="orchestra-name-unit">
                            {orq.trim()}
                            {orqIndex < arr.length - 1 && <span className="orchestra-separator">,</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Breakdown */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-700/50 rounded-xl p-4 border border-gray-600/30">
              <h3 className="text-lg font-bold mb-4 text-green-400 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Por Mes {selectedYear}
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {Object.entries(monthlyStats).map(([month, orquestas]) => {
                  const maxOrquestasPorMes = getMaxOrquestasPorMes();
                  const topOrquestas = Object.entries(orquestas)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, maxOrquestasPorMes);
                  
                  const totalMonth = Object.values(orquestas).reduce((sum, count) => sum + count, 0);

                  return (
                    <div key={month} className="bg-gray-700/30 rounded-lg p-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-yellow-300 capitalize">{month}</span>
                        <span className="text-blue-400 text-sm">{totalMonth} total</span>
                      </div>
                      <div className="space-y-2 overflow-x-hidden">
                        {topOrquestas.map(([orq, count]) => (
                          <div key={orq} className="w-full min-w-0 bg-gray-600/20 rounded p-2">
                            {/* Número de actuaciones arriba */}
                            <div className="flex justify-end mb-1">
                              <span className="text-green-400 font-bold text-sm bg-green-500/20 px-2 py-1 rounded-full">
                                {count}
                              </span>
                            </div>
                            
                            {/* Nombre de orquesta abajo, ancho completo */}
                            <div className="w-full min-w-0">
                              <div className={`text-gray-300 orchestra-names-container ${screenSize === 'mobile' ? 'text-xs' : 'text-xs'}`}>
                                {orq.split(',').map((subOrq, subIndex, subArr) => (
                                  <span key={subIndex} className="orchestra-name-unit">
                                    {subOrq.trim()}
                                    {subIndex < subArr.length - 1 && <span className="orchestra-separator">,</span>}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                        {Object.keys(orquestas).length > maxOrquestasPorMes && (
                          <div className="text-xs text-gray-500 mt-2 border-t border-gray-600/30 pt-2">
                            +{Object.keys(orquestas).length - maxOrquestasPorMes} más...
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsTablesMini;
