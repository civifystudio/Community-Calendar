
'use server';

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy';
  icon: 'Sun' | 'Cloud' | 'CloudRain';
}

// Maps WMO weather codes to our app's simplified weather conditions.
function mapWeatherCode(code: number): { condition: WeatherData['condition']; icon: WeatherData['icon'] } {
  // Codes for rain/drizzle/showers/thunderstorm
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) {
    return { condition: 'Rainy', icon: 'CloudRain' };
  }
  // Code for clear sky
  if (code === 0) {
    return { condition: 'Sunny', icon: 'Sun' };
  }
  // All other codes (clouds, fog, snow, etc.) are mapped to Cloudy
  return { condition: 'Cloudy', icon: 'Cloud' };
}

export async function getWeatherForDay(day: number): Promise<WeatherData | null> {
  if (!day || day < 1 || day > 31) return null;

  // Using Arvin, CA coordinates
  const latitude = 35.2;
  const longitude = -118.83;
  
  // The calendar is set to July 2025
  const date = `2025-07-${day.toString().padStart(2, '0')}`;
  
  // Using the free Open-Meteo API, which doesn't require an API key.
  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weather_code,temperature_2m_max&timezone=America/Los_Angeles&start_date=${date}&end_date=${date}`;

  try {
    const response = await fetch(apiUrl, { cache: 'no-store' }); // Fetch fresh data every time
    if (!response.ok) {
      console.error('Failed to fetch weather data:', response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        console.error('Invalid weather data received from API');
        return null;
    }

    const weatherCode = data.daily.weather_code[0];
    const maxTemp = data.daily.temperature_2m_max[0];
    
    const { condition, icon } = mapWeatherCode(weatherCode);
    
    // The API returns temp in Celsius, converting to Fahrenheit for consistency with previous mock.
    const tempFahrenheit = Math.round(maxTemp * 9/5 + 32);

    return {
      temp: tempFahrenheit,
      condition,
      icon,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return null; // Return null on error to avoid crashing the app
  }
}
