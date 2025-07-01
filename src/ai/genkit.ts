import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is a simplified initialization. In a real app, you might
// want to add more plugins for production monitoring and tracing.
export const ai = genkit({
  plugins: [
    googleAI(),
  ],
});
