
'use server';

import { format } from 'date-fns';

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy';
  icon: 'Sun' | 'Cloud' | 'CloudRain';
}

// Maps Tomorrow.io weather codes to our app's simplified weather conditions.
// https://docs.tomorrow.io/reference/data-layers-weather-codes
function mapWeatherCode(code: number): { condition: WeatherData['condition']; icon: WeatherData['icon'] } {
  const codeStr = code.toString();
  switch (codeStr[0]) {
    case '1': // Mostly weather related to sun/clouds
      if (code === 1000) return { condition: 'Sunny', icon: 'Sun' };
      return { condition: 'Cloudy', icon: 'Cloud' };
    case '4': // Rain
    case '6': // Freezing Rain
    case '7': // Ice
    case '8': // Thunderstorm
      return { condition: 'Rainy', icon: 'CloudRain' };
    case '2': // Fog
    case '5': // Snow
    default:
      return { condition: 'Cloudy', icon: 'Cloud' };
  }
}

export async function getWeatherForDay(dateObj: Date | null): Promise<WeatherData | null> {
  if (!dateObj) return null;

  // Arvin, CA coordinates
  const location = '35.2,-118.83';
  const apiKey = process.env.TOMORROW_API_KEY;

  if (!apiKey) {
    console.error('Tomorrow.io API key is not set.');
    return null;
  }
  
  const fields = 'weatherCode,temperature';
  const units = 'imperial'; // Get temperature in Fahrenheit
  const timesteps = '1d'; // Get daily forecast
  
  const apiUrl = `https://api.tomorrow.io/v4/weather/forecast?location=${location}&fields=${fields}&units=${units}&timesteps=${timesteps}&apikey=${apiKey}`;

  try {
    const response = await fetch(apiUrl, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch weather data:', response.status, response.statusText);
      const errorBody = await response.text();
      console.error('Error Body:', errorBody);
      return null;
    }

    const data = await response.json();
    
    if (!data.timelines || !data.timelines.daily || data.timelines.daily.length === 0) {
      console.error('Invalid weather data received from API:', data);
      return null;
    }

    // Find the forecast for the specific day requested
    const requestedDateStr = format(dateObj, 'yyyy-MM-dd');
    const dailyForecast = data.timelines.daily.find((day: any) => day.time.startsWith(requestedDateStr));

    if (!dailyForecast) {
      console.error(`No forecast found for date: ${requestedDateStr}`);
      return null;
    }

    const weatherCode = dailyForecast.values.weatherCode;
    const temp = dailyForecast.values.temperature;
    
    const { condition, icon } = mapWeatherCode(weatherCode);

    return {
      temp: Math.round(temp),
      condition,
      icon,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null; // Return null on error to avoid crashing the app
  }
}
