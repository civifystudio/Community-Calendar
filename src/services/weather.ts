
'use server';

export interface WeatherData {
  temp: number;
  condition: 'Sunny' | 'Cloudy' | 'Rainy';
  icon: 'Sun' | 'Cloud' | 'CloudRain';
}

export async function getWeatherForDay(day: number): Promise<WeatherData | null> {
  // In a real app, you would fetch from a weather API here.
  // For this example, we'll return mock data.
  if (!day) return null;

  // Let's create some deterministic "random" weather based on the day.
  const seed = day * 3 + (day % 5) + (day % 2); // just some pseudo-randomness
  const temp = 65 + (seed % 15);
  const conditionSeed = seed % 10;

  if (conditionSeed < 5) {
    return { temp, condition: 'Sunny', icon: 'Sun' };
  } else if (conditionSeed < 8) {
    return { temp, condition: 'Cloudy', icon: 'Cloud' };
  } else {
    return { temp, condition: 'Rainy', icon: 'CloudRain' };
  }
}
