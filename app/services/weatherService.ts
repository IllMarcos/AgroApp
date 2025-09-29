// En: app/services/weatherService.ts

const API_KEY = "fd2d74c664ffbbcb2245dfba30d0c781";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

export const getWeatherByCity = async (city: string) => {
  // La comprobación ahora es más simple
  if (!API_KEY) {
    throw new Error("API Key de OpenWeatherMap no configurada.");
  }

  try {
    const response = await fetch(
      `${API_URL}?q=${city},MX&appid=${API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      throw new Error("No se pudo obtener la información del clima.");
    }

    return await response.json();
  } catch (error) {
    console.error("Error en el servicio del clima:", error);
    throw error;
  }
};