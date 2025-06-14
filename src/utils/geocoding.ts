import { Coordinates, MunicipioMapping } from '../types';

export const municipioMapping: MunicipioMapping = {
  "Adeje": "Adeje",
  "Arafo": "Arafo",
  "Arona": "Arona",
  "Buenavista": "Buenavista del Norte",
  "Candelaria": "Candelaria",
  "Rosario": "El Rosario",
  "Sauzal": "El Sauzal",
  "Tanque": "El Tanque",
  "Fasnia": "Fasnia",
  "Garachico": "Garachico",
  "Granadilla": "Granadilla de Abona",
  "Guancha": "La Guancha",
  "Guía": "Guía de Isora",
  "Güímar": "Güímar",
  "Icod": "Icod de los Vinos",
  "Matanza": "La Matanza de Acentejo",
  "Orotava": "La Orotava",
  "Puerto": "Puerto de la Cruz",
  "Realejos": "Los Realejos",
  "Laguna": "San Cristóbal de La Laguna",
  "San Juan Rambla": "San Juan de la Rambla",
  "San Miguel": "San Miguel de Abona",
  "Santa Cruz": "Santa Cruz de Tenerife",
  "Santa Úrsula": "Santa Úrsula",
  "Santiago Teide": "Santiago del Teide",
  "Tacoronte": "Tacoronte",
  "Tegueste": "Tegueste",
  "Victoria": "La Victoria de Acentejo",
  "Vilaflor": "Vilaflor de Chasna",
  "Silos": "Los Silos"
};

export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  if (!address || address.startsWith(",")) {
    console.warn("Dirección inválida:", address);
    return null;
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'VerbenasTenerife/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    console.warn("No se encontraron coordenadas para:", address);
    return null;
  } catch (error) {
    console.error("Error en geocodificación:", error);
    return null;
  }
}
