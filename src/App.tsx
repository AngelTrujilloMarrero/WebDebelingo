import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import EventsList from './components/EventsList';
import MapComponent from './components/MapComponent';
import GeminiChat from './components/GeminiChat';
import Statistics from './components/Statistics';
import StatsTables from './components/StatsTables';
import VisitCounter from './components/VisitCounter';
import SocialMedia from './components/SocialMedia';
import { useEvents } from './hooks/useEvents';
import { Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Event } from './types';
import { groupEventsByDay, sortEventsByDateTime } from './utils/helpers';

function App() {
  const { events, loading } = useEvents();
  const [festivalSelectionVisible, setFestivalSelectionVisible] = useState(false);
  const [selectedFestival, setSelectedFestival] = useState('');

  // Export functions
  const exportWeekToImage = useCallback(async () => {
    const currentDate = new Date();
    
    // Fecha de inicio: 1 día anterior al día actual
    const startDate = new Date(currentDate);
    startDate.setDate(currentDate.getDate() - 1);
    
    // Fecha de fin: domingo de la semana actual
    const endDate = new Date(currentDate);
    const daysUntilSunday = 7 - currentDate.getDay(); // Días que faltan para llegar al domingo
    if (currentDate.getDay() === 0) {
      // Si hoy es domingo, usar hoy como fecha final
      endDate.setDate(currentDate.getDate());
    } else {
      // Si no es domingo, ir al próximo domingo
      endDate.setDate(currentDate.getDate() + daysUntilSunday);
    }

    // Filter events from 1 day ago until next Sunday
    const weekEvents = events.filter(event => {
      const eventDate = new Date(event.day);
      return eventDate >= startDate && eventDate <= endDate;
    });

    if (weekEvents.length === 0) {
      alert('No hay eventos programados para el período seleccionado');
      return;
    }

    // Create temporary container for export
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      width: 800px;
      padding: 20px;
      background: white;
      font-family: Arial, sans-serif;
      position: absolute;
      top: -9999px;
      left: -9999px;
    `;

    // Add header with dynamic date range
    const header = document.createElement('h2');
    const startDateStr = startDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' });
    const endDateStr = endDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    header.textContent = `VERBENAS DEL ${startDateStr} AL ${endDateStr}`;
    header.style.cssText = `
      text-align: center;
      color: #333;
      font-size: 2em;
      margin-bottom: 20px;
      border-bottom: 3px solid #007BFF;
      padding-bottom: 10px;
    `;
    tempContainer.appendChild(header);

    // Group events by day (without date filtering for export)
    const eventsByDay: { [key: string]: Event[] } = {};
    weekEvents.forEach(event => {
      const dayKey = event.day;
      if (!eventsByDay[dayKey]) {
        eventsByDay[dayKey] = [];
      }
      eventsByDay[dayKey].push(event);
    });

    // Sort days chronologically
    const sortedDays = Object.keys(eventsByDay).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    // Add events
    sortedDays.forEach(dayKey => {
      const dayEvents = eventsByDay[dayKey];
      
      // Sort events within each day by time
      dayEvents.sort((a, b) => {
        return new Date(`${a.day}T${a.hora}`).getTime() - new Date(`${b.day}T${b.hora}`).getTime();
      });
      
      const dayDate = new Date(dayKey);
      const dayName = dayDate.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });

      const dayHeader = document.createElement('h3');
      dayHeader.textContent = dayName.toUpperCase();
      dayHeader.style.cssText = `
        color: #007BFF;
        font-size: 1.5em;
        margin: 20px 0 10px 0;
        text-decoration: underline;
      `;
      tempContainer.appendChild(dayHeader);

      dayEvents.forEach(event => {
        const eventP = document.createElement('p');
        let eventText = `${event.hora}H | `;
        if (event.tipo !== 'Baile Normal') {
          eventText += `${event.tipo} | `;
        }
        eventText += `${event.lugar ? event.lugar + ', ' : ''}${event.municipio} - ${event.orquesta}`;
        
        eventP.textContent = eventText;
        eventP.style.cssText = `
          margin: 5px 0;
          font-size: 1.1em;
          color: #333;
        `;
        tempContainer.appendChild(eventP);
      });
    });

    // Add footer
    const footer = document.createElement('p');
    footer.textContent = 'Más info en: https://debelingoconangel.web.app';
    footer.style.cssText = `
      text-align: center;
      color: #666;
      font-size: 0.9em;
      margin-top: 20px;
    `;
    tempContainer.appendChild(footer);

    document.body.appendChild(tempContainer);

    try {
      const canvas = await html2canvas(tempContainer, { 
        backgroundColor: '#ffffff',
        scale: 2 
      });
      
      const link = document.createElement('a');
      const startDateFileName = startDate.toLocaleDateString('es-ES').replace(/\//g, '-');
      const endDateFileName = endDate.toLocaleDateString('es-ES').replace(/\//g, '-');
      link.download = `Verbenas_${startDateFileName}_al_${endDateFileName}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Error al exportar la imagen');
    } finally {
      document.body.removeChild(tempContainer);
    }
  }, [events]);

  // Get unique festivals for selection
  const getUniqueFestivals = useCallback(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 2);
    cutoffDate.setHours(0, 0, 0, 0);
    
    const currentEvents = events.filter(event => {
      const eventDate = new Date(event.day);
      return eventDate >= cutoffDate;
    });

    const uniqueFestivals = [...new Set(currentEvents.map(event => {
      return event.lugar ? `${event.lugar}, ${event.municipio}` : event.municipio;
    }))];

    return uniqueFestivals;
  }, [events]);

  // Export specific festival to image
  const exportFestivalToImage = useCallback(async (selectedFestival: string) => {
    if (!selectedFestival) return;

    let lugar = '';
    let municipio = '';
    
    if (selectedFestival.includes(',')) {
      [lugar, municipio] = selectedFestival.split(', ');
    } else {
      lugar = '';
      municipio = selectedFestival;
    }

    // Calculate cutoff date (2 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 2);
    cutoffDate.setHours(0, 0, 0, 0);
    const cutoffDateString = cutoffDate.toISOString().split('T')[0];

    // Filter events for this festival
    const festivalEvents = events.filter(event => 
      event.lugar === lugar && 
      event.municipio === municipio && 
      event.day >= cutoffDateString
    );

    if (festivalEvents.length === 0) {
      alert('No hay eventos programados para esta fiesta');
      return;
    }

    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.style.cssText = `
      width: 1200px;
      height: 1200px;
      position: relative;
      padding: 20px;
      text-align: center;
      margin: 0 auto;
      border-radius: 10px;
      box-sizing: border-box;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      max-width: 1200px;
      position: absolute;
      top: -9999px;
      left: -9999px;
    `;

    // Background div
    const backgroundDiv = document.createElement('div');
    backgroundDiv.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      opacity: 0.5;
    `;

    // Base URLs for background images
    const baseUrls = [
      'https://debelingoconangel.web.app/fotos/',
      'https://debelingo.webcindario.com/',
      'http://debelingoconangel.infy.uk/fotos/'
    ];

    // Normalize location names
    const normalizedLugar = lugar
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'ñ')
      .replace(/\s+/g, '');
    
    const normalizedMunicipio = municipio
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ñ/g, 'ñ')
      .replace(/\s+/g, '');

    // Generate possible image URLs
    const possibleImages = [
      `${baseUrls[0]}${normalizedLugar}.jpg`,
      `${baseUrls[1]}${normalizedLugar}.jpg`,
      `${baseUrls[2]}${normalizedLugar}.jpg`,
      `${baseUrls[0]}${normalizedLugar}.png`,
      `${baseUrls[1]}${normalizedLugar}.png`,
      `${baseUrls[2]}${normalizedLugar}.png`,
      `${baseUrls[0]}${normalizedMunicipio}.jpg`,
      `${baseUrls[0]}${normalizedMunicipio}.png`,
      `${baseUrls[0]}${normalizedLugar}_${normalizedMunicipio}.jpg`,
      `${baseUrls[1]}${normalizedMunicipio}.jpg`,
      `${baseUrls[2]}${normalizedMunicipio}.jpg`
    ];

    const createContent = () => {
      // Content div
      const contentDiv = document.createElement('div');
      contentDiv.style.cssText = `
        position: relative;
        z-index: 10;
        background-color: rgba(255, 255, 255, 0.9);
        border: 2px solid #000000;
        padding: 20px;
        border-radius: 10px;
        max-width: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        box-sizing: border-box;
        width: 98%;
        margin: 1%;
      `;

      // Generation date
      const generationDate = document.createElement('p');
      generationDate.style.cssText = `
        font-size: 0.8em;
        color: #888888;
        margin-bottom: 5px;
        font-family: Arial, sans-serif;
      `;
      generationDate.textContent = `Generado ${new Date().toLocaleString('es-ES')}`;
      contentDiv.appendChild(generationDate);

      // Festival header
      const festivalHeader = document.createElement('h2');
      festivalHeader.style.cssText = `
        color: #330000;
        font-weight: bold;
        text-decoration: underline;
        margin-bottom: 20px;
        font-size: 3em;
        font-family: Impact, sans-serif;
        text-shadow: -2px -2px 0 yellow, 2px 2px 0 gold;
        border: 6px solid #000000;
        background-color: rgba(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, 0.7);
        padding: 10px;
      `;
      
      if (lugar) {
        festivalHeader.textContent = `VERBENAS ${lugar.toUpperCase()}-${municipio.toUpperCase()}`;
      } else {
        festivalHeader.textContent = `VERBENAS ${municipio.toUpperCase()}`;
      }
      contentDiv.appendChild(festivalHeader);

      // Sort events
      festivalEvents.sort((a, b) => {
        const dateA = new Date(`${a.day}T${a.hora}`);
        const dateB = new Date(`${b.day}T${b.hora}`);
        return dateA.getTime() - dateB.getTime();
      });

      // Group events by day
      const eventsByDay: { [key: string]: Event[] } = {};
      festivalEvents.forEach(event => {
        const eventDate = new Date(event.day);
        const dayKey = eventDate.toISOString().split('T')[0];
        if (!eventsByDay[dayKey]) {
          eventsByDay[dayKey] = [];
        }
        eventsByDay[dayKey].push(event);
      });

      // Add events
      Object.entries(eventsByDay).forEach(([dayKey, dayEvents]) => {
        const dayDate = new Date(dayKey);
        const dayName = dayDate.toLocaleDateString('es-ES', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          year: 'numeric' 
        }).toUpperCase();

        const dayHeader = document.createElement('h3');
        dayHeader.textContent = dayName;
        dayHeader.style.cssText = `
          color: #006400;
          font-weight: bold;
          text-decoration: underline;
          margin-bottom: 10px;
          font-size: 2em;
          font-family: Impact, sans-serif;
          text-shadow: -2px -2px 0 yellow, 2px 2px 0 gold;
        `;
        contentDiv.appendChild(dayHeader);

        dayEvents.forEach(event => {
          let eventText = `<strong style="font-size: 1.5em; color: blue;">${event.hora}H</strong> | `;
          
          if (event.tipo !== 'Baile Normal') {
            eventText += `<strong style="font-size: 1.5em;">${event.tipo}</strong> | `;
          }
          
          eventText += `<strong style="font-size: 1.5em; color: black; font-family: Helvetica Black, sans-serif; text-shadow: -2px -2px 0 red, 2px 2px 0 red;">${event.orquesta}</strong>`;

          const eventParagraph = document.createElement('p');
          eventParagraph.innerHTML = eventText;
          eventParagraph.style.cssText = `
            color: #000000;
            margin: 5px 0;
            font-size: 1.5em;
            font-family: Impact, sans-serif;
            text-shadow: -2px -2px 0 yellow, 2px 2px 0 gold;
          `;
          contentDiv.appendChild(eventParagraph);
        });
      });

      // Info text
      const infoText = document.createElement('p');
      infoText.style.cssText = `
        font-size: 1.2em;
        color: #FF0000;
        margin-top: 20px;
        font-family: Arial, sans-serif;
        font-weight: bold;
      `;
      infoText.innerHTML = 'Más info en: https://debelingoconangel.web.app';
      contentDiv.appendChild(infoText);

      tempContainer.appendChild(backgroundDiv);
      tempContainer.appendChild(contentDiv);
      document.body.appendChild(tempContainer);

      // Generate image after small delay
      setTimeout(() => {
        html2canvas(tempContainer, {
          width: 1200,
          height: 1200,
          backgroundColor: null,
          useCORS: true
        }).then(canvas => {
          const link = document.createElement('a');
          const filename = lugar ? `${lugar}_${municipio}_2025.png` : `${municipio}_2025.png`;
          link.download = filename;
          link.href = canvas.toDataURL('image/png');
          link.click();

          document.body.removeChild(tempContainer);
        }).catch(error => {
          console.error('Error generating image:', error);
          document.body.removeChild(tempContainer);
          alert('Error al generar la imagen. Inténtalo de nuevo.');
        });
      }, 100);
    };

    // Try to load background image
    const tryNextImage = (index: number): void => {
      if (index >= possibleImages.length) {
        backgroundDiv.style.backgroundColor = 'white';
        createContent();
        return;
      }

      const img = new Image();
      img.src = possibleImages[index];
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        backgroundDiv.style.backgroundImage = `url('${possibleImages[index]}')`;
        createContent();
      };
      img.onerror = () => {
        tryNextImage(index + 1);
      };
    };

    tryNextImage(0);
  }, [events]);

  const showFestivalSelection = useCallback(() => {
    setFestivalSelectionVisible(!festivalSelectionVisible);
  }, [festivalSelectionVisible]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 text-blue-500 animate-spin mx-auto" />
          <h2 className="text-2xl font-bold text-white">Cargando Verbenas de Tenerife...</h2>
          <p className="text-gray-300">Conectando con Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-12">
        {/* Events List */}
        <section>
          <EventsList 
            events={events} 
            onExportWeek={exportWeekToImage}
            onExportFestival={showFestivalSelection}
          />
        </section>

        {/* Festival Selection Modal */}
        {festivalSelectionVisible && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Seleccionar Fiesta para Exportar</h3>
              
              {getUniqueFestivals().length > 0 ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecciona una fiesta:
                    </label>
                    <select
                      value={selectedFestival}
                      onChange={(e) => setSelectedFestival(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    >
                      <option value="">-- Selecciona una fiesta --</option>
                      {getUniqueFestivals().map((festival, index) => (
                        <option key={index} value={festival}>
                          Verbenas de {festival}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setFestivalSelectionVisible(false);
                        setSelectedFestival('');
                      }}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (selectedFestival) {
                          exportFestivalToImage(selectedFestival);
                          setFestivalSelectionVisible(false);
                          setSelectedFestival('');
                        } else {
                          alert('Por favor selecciona una fiesta');
                        }
                      }}
                      disabled={!selectedFestival}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300"
                    >
                      Exportar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">No hay fiestas disponibles para exportar en este momento.</p>
                  <button
                    onClick={() => setFestivalSelectionVisible(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cerrar
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Map */}
        <section>
          <MapComponent events={events} />
        </section>

        {/* Gemini Chat */}
        <section>
          <GeminiChat events={events} />
        </section>

        {/* Statistics */}
        <section>
          <Statistics events={events} />
        </section>

        {/* Statistics Tables */}
        <section>
          <StatsTables events={events} />
        </section>

        {/* Visit Counter */}
        <section>
          <VisitCounter />
        </section>

        {/* Social Media */}
        <section>
          <SocialMedia />
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-300">
            © 2024 De Belingo Con Ángel - Verbenas en Tenerife
          </p>
          <p className="text-gray-400 text-sm mt-2">
            Desarrollado con 💙 para la comunidad canaria
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
