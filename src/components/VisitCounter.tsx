import React from 'react';
import { Eye, Users, TrendingUp } from 'lucide-react';
import { useVisitCounter } from '../hooks/useVisitCounter';

const VisitCounter: React.FC = () => {
  const visitCount = useVisitCounter();

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-white text-center flex items-center justify-center gap-3">
          <Eye className="w-8 h-8 animate-pulse" />
          Contador de Visitas
          <TrendingUp className="w-8 h-8 animate-pulse" />
        </h2>
      </div>

      <div className="p-8 text-center">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Users className="w-12 h-12 text-emerald-400" />
            <div>
              <div className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                {visitCount.toLocaleString('es-ES')}
              </div>
              <div className="text-emerald-300 font-semibold text-lg">
                visitas a la página
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-2 mt-6">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            <div 
              className="w-3 h-3 bg-teal-400 rounded-full animate-ping" 
              style={{ animationDelay: '0.2s' }}
            ></div>
            <div 
              className="w-3 h-3 bg-emerald-400 rounded-full animate-ping" 
              style={{ animationDelay: '0.4s' }}
            ></div>
          </div>

        
        </div>
      </div>
    </div>
  );
};

export default VisitCounter;
