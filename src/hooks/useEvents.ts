import { useState, useEffect } from 'react';
import { onValue } from '../utils/firebase';
import { eventsRef } from '../utils/firebase';
import { Event } from '../types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(eventsRef, (snapshot) => {
      const loadedEvents: Event[] = [];
      const data = snapshot.val();
      
      if (data) {
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          const event: Event = { id: key, ...value };
          
          // Solo agregar eventos que NO estén cancelados
          if (!event.cancelado) {
            if (!event.FechaEditado) {
              event.FechaEditado = event.FechaAgregado;
            }
            loadedEvents.push(event);
          }
        });
      }
      
      setEvents(loadedEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { events, loading };
}
