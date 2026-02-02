import type { NextApiRequest, NextApiResponse } from 'next';
import { InvocationContext, createSession } from '@google/adk';

import { rootAgent } from '../../agent';

export const config = {
  api: {
    bodyParser: true,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { appName, userId, sessionId, newMessage } = req.body;
  const authHeader = req.headers.authorization ?? '';
  const session = createSession({
  appName,
  userId,
  sessionId,    
  });
  const parentContext = new InvocationContext({
  session,                // full Session object
  userContent: newMessage,
  runConfig: {
    metadata: {
      authHeader,
    },
  },
});

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    for await (const event of rootAgent.runAsync(parentContext)) {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
    res.end();
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: err?.message || 'Unknown error' })}\n\n`);
    res.end();
  }
}