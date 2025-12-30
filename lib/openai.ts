import OpenAI from 'openai';

// Allow build to succeed without API key, but will fail at runtime if not provided
const apiKey = process.env.OPENAI_API_KEY || 'placeholder-key-for-build';

export const openai = new OpenAI({
  apiKey: apiKey,
});

export function validateApiKey() {
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'placeholder-key-for-build') {
    throw new Error('Missing OPENAI_API_KEY environment variable. Please add it to your .env.local file.');
  }
}

