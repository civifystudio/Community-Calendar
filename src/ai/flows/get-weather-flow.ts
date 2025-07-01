'use server';
/**
 * @fileOverview An AI flow for fetching weather data using a tool.
 *
 * - getWeatherFromAI - A function that asks an AI for the weather.
 * - WeatherData - The type for the weather data returned.
 */
import {ai} from '@/ai/genkit';
import {getWeatherForDay} from '@/services/weather';
import type {WeatherData as WeatherDataType} from '@/services/weather';
import {z} from 'zod';

// Re-exporting the type for convenience
export type {WeatherDataType as WeatherData};

// Define the schema for the data we want the AI to return.
// This matches the WeatherData interface.
const WeatherDataSchema = z.object({
  temp: z.number().describe('The temperature in Fahrenheit.'),
  condition: z.enum(['Sunny', 'Cloudy', 'Rainy']).describe('The general weather condition.'),
  icon: z.enum(['Sun', 'Cloud', 'CloudRain']).describe('An icon name representing the condition.'),
});

// Define a tool that the AI can use to fetch weather data.
// The AI will learn to call this tool when it needs weather information.
const fetchWeatherForDayTool = ai.defineTool(
  {
    name: 'fetchWeatherForDay',
    description: 'Gets the weather forecast for a specific date in Arvin, California.',
    inputSchema: z.object({
      date: z.string().describe("The date to get the weather for, in 'yyyy-MM-dd' format."),
    }),
    outputSchema: WeatherDataSchema.nullable(),
  },
  async (input) => {
    // The tool calls our existing weather service function.
    return getWeatherForDay(new Date(input.date));
  }
);

// Define the prompt for the AI.
const weatherPrompt = ai.definePrompt({
    name: 'weatherPrompt',
    // Tell the AI about the tool it can use.
    tools: [fetchWeatherForDayTool],
    // The prompt instructs the AI on its task.
    prompt: 'What is the weather in Arvin, California for {{date}}? Use the available tools to find out.',
    // Tell the AI what format to return the data in.
    output: {
        schema: WeatherDataSchema,
    },
});

// Define the AI flow. A flow orchestrates prompts and tools.
const weatherFlow = ai.defineFlow(
    {
        name: 'weatherFlow',
        inputSchema: z.object({ date: z.string() }),
        outputSchema: WeatherDataSchema.nullable(),
    },
    async (input) => {
        const {output} = await weatherPrompt(input);
        return output;
    }
);

// Export a simple function that the UI can call.
export async function getWeatherFromAI(date: Date): Promise<WeatherDataType | null> {
    try {
        // Format date for the flow input
        const dateString = date.toISOString().split('T')[0];
        return await weatherFlow({date: dateString});
    } catch (error) {
        console.error("Error getting weather from AI flow:", error);
        return null;
    }
}
