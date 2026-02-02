import { z } from 'zod';

export const withAuthToken = (schema: any) => schema.extend({
  authToken: z.string().optional().describe('User authorization token, if available.'),
});

export const DEFAULT_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjUsImVtYWlsIjoibm9ydG9udG9uZzE4MDZAZ21haWwuY29tIiwiaWF0IjoxNzY5OTIwNDc4LCJleHAiOjE3NzA1MjUyNzh9.PZSevgKfq2jh40bipkeC1dz6VyzgjTiLT8u8X81_I_o";

export function getAuthToken(authToken?: string) {
  return authToken && authToken.length > 0 ? authToken : DEFAULT_TOKEN;
}

export function extractAuthToken(params: any) {
  const { authToken, ...rest } = params;
  return { authToken, rest };
}
