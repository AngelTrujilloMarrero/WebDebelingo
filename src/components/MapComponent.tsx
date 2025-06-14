import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
// CORRECCIÓN: Se renombra el icono 'Map' a 'MapIcon' para evitar conflictos con el objeto nativo Map de JS.
import { Map as MapIcon, Navigation, AlertCircle, MapPin, Calendar, Clock } from 'lucide-react';
import { Event } from '../types';
import { geocodeAddress, municipioMapping } from '../utils/geocoding';
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  events: Event[];
}

const MapComponent: React.FC<MapComponentProps> = ({ events }) => {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Filter events for map display
  const mapEvents = events.filter(event => {
    if (event.cancelado) return false;
    
    const eventDate = new Date(event.day);
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
    
    return eventDate >= twoDaysAgo;
  });

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
      // Initialize map
      const tenerifeCenter: [number, number] = [28.291563, -16.629126];
      const tenerifeBounds: L.LatLngBoundsExpression = [
        [28.025, -16.925], // Southwest
        [28.625, -16.075]  // Northeast
      ];

      const map = L.map(mapRef.current, {
        center: tenerifeCenter,
        zoom: window.innerWidth < 768 ? 9.2 : 9.7,
        minZoom: window.innerWidth < 768 ? 9.2 : 9.7,
        maxZoom: 18,
        maxBounds: tenerifeBounds,
        maxBoundsViscosity: 1.0,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      mapInstanceRef.current = map;

      // Custom red marker icon
      const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [40, 66],
        iconAnchor: [20, 66],
        popupAnchor: [1, -34],
        shadowSize: [66, 66]
      });

      // Load markers
      const loadMarkers = async () => {
        setIsLoading(true);
        
        // CORRECCIÓN: Al renombrar el icono, 'new Map()' ahora se refiere correctamente al objeto nativo de JS.
        const eventsByAddress = new Map<string, Event[]>();
        for (const event of mapEvents) {
            const fullMunicipioName = municipioMapping[event.municipio] || event.municipio;
            const address = event.lugar 
                ? `${event.lugar}, ${fullMunicipioName}, Tenerife, España`
                : `${fullMunicipioName}, Tenerife, España`;

            if (!eventsByAddress.has(address)) {
                eventsByAddress.set(address, []);
            }
            eventsByAddress.get(address)!.push(event);
        }
        
        const addresses = Array.from(eventsByAddress.keys());
        for (let i = 0; i < addresses.length; i++) {
          const address = addresses[i]; // Esto ahora se inferirá correctamente como 'string'
          const eventsAtLocation = eventsByAddress.get(address)!;

          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          try {
            // CORRECCIÓN: 'address' ya es de tipo 'string', por lo que no hay error de tipado.
            const coordinates = await geocodeAddress(address);
            
            if (coordinates && mapInstanceRef.current) {
              eventsAtLocation.sort((a, b) => {
                  const dateA = new Date(`${a.day}T${a.hora}`);
                  const dateB = new Date(`${b.day}T${b.hora}`);
                  return dateA.getTime() - dateB.getTime();
              });

              const locationName = eventsAtLocation[0].lugar || municipioMapping[eventsAtLocation[0].municipio] || eventsAtLocation[0].municipio;
              const googleMapsLink = `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`;
              
              let popupContent = `
                <div style="padding: 8px; min-width: 250px; max-height: 300px; overflow-y: auto;">
                  <div style="font-weight: bold; font-size: 16px; color: #1e40af; text-align: center; border-bottom: 1px solid #ccc; padding-bottom: 8px; margin-bottom: 8px;">
                    📍 ${locationName}
                  </div>`;
              
              eventsAtLocation.forEach(event => {
                const eventDay = new Date(event.day).toLocaleDateString('es-ES', { weekday: 'long' });
                popupContent += `
                  <div style="border-bottom: 1px solid #eee; padding-bottom: 8px; margin-bottom: 8px;">
                    <div style="font-weight: bold; font-size: 1.1em; color: #1e40af; margin-bottom: 4px;">${event.orquesta}</div>
                    <div><strong>📅 Fecha:</strong> ${event.day} (${eventDay})</div>
                    <div><strong>🕐 Hora:</strong> ${event.hora}</div>
                  </div>
                `;
              });

              popupContent += `
                  <div style="text-align: center; margin-top: 8px;">
                    <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 4px; text-decoration: none; font-size: 14px;">
                      🧭 Cómo llegar
                    </a>
                  </div>
                </div>
              `;

              const marker = L.marker([coordinates.lat, coordinates.lng], { icon: redIcon })
                .bindPopup(popupContent);
              
              marker.addTo(mapInstanceRef.current);
            }
          } catch (error) {
            console.error('Error geocoding address:', address, error);
          }
          
          setLoadingProgress(((i + 1) / addresses.length) * 100);
        }
        
        setIsLoading(false);
      };

      if (mapEvents.length > 0) {
        loadMarkers();
      } else {
        setIsLoading(false);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg text-center font-bold shadow-lg">
        <div className="flex items-center justify-center gap-2">
          {/* CORRECCIÓN: Usar el componente renombrado 'MapIcon' */}
          <MapIcon className="w-6 h-6" />
          <span className="text-lg">UBICACIÓN APROXIMADA DE LAS VERBENAS</span>
          <Navigation className="w-6 h-6" />
        </div>
      </div>

      {isLoading && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 font-bold">
              <AlertCircle className="w-5 h-5 animate-spin" />
              <span>Cargando verbenas en el mapa...</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-400 to-pink-400 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadingProgress}%` }}
              >
                <div className="h-full bg-gradient-to-r from-white/30 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-center text-sm">
              {Math.round(loadingProgress)}% - {isLoading ? 'Cargando verbenas...' : 'VERBENAS CARGADAS EN EL MAPA'}
            </div>
          </div>
        </div>
      )}

      <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10">
        <div 
          ref={mapRef}
          style={{ height: '500px', width: '100%' }}
          className="leaflet-container"
        />
      </div>
    </div>
  );
};

export default MapComponent;
