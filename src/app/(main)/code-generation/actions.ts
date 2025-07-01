'use server';

import { generateApiRoute } from '@/ai/flows/generate-api-route';
import { generateDataFetchingCode } from '@/ai/flows/generate-data-fetching-code';

export async function handleApiRouteGeneration(_prevState: any, formData: FormData) {
  const prompt = formData.get('prompt') as string;
  if (!prompt) {
    return { code: '', error: 'Prompt is required.' };
  }

  try {
    const result = await generateApiRoute({ description: prompt });
    return { code: result.code };
  } catch (error) {
    console.error(error);
    return { code: '', error: 'Failed to generate API route. Please try again.' };
  }
}

export async function handleDataFetchingGeneration(_prevState: any, formData: FormData) {
  const prompt = formData.get('prompt') as string;
  if (!prompt) {
    return { code: '', error: 'Prompt is required.' };
  }

  try {
    const result = await generateDataFetchingCode({ prompt: prompt });
    return { code: result.code };
  } catch (error) {
    console.error(error);
    return { code: '', error: 'Failed to generate data fetching code. Please try again.' };
  }
}
