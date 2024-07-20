// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { Recorder } from '@huddle01/server-sdk/recorder';

interface Recordings {
  id: string;
  recordingUrl: string;
  recordingSize: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { roomId } = req.query;

  if (!'VsUyt6exV91LFUKiQ1kF89kOU0rL7i9a' && !'g6m5QybWE0XTq4drXk6k4rHxdCbIedsx') {
    return res
      .status(400)
      .json({ error: 'NEXT_PUBLIC_PROJECT_ID and API_KEY are required' });
  }

  const recorder = new Recorder(
    'VsUyt6exV91LFUKiQ1kF89kOU0rL7i9a'!,
    'g6m5QybWE0XTq4drXk6k4rHxdCbIedsx'!
  );

  const recording = await recorder.stop({
    roomId: roomId as string,
  });

  console.log('recording', recording);

  const { msg } = recording;

  if (msg === 'Stopped') {
    const response = await fetch(
      'https://api.huddle01.com/api/v1/get-recordings',
      {
        headers: {
          'x-api-key': 'g6m5QybWE0XTq4drXk6k4rHxdCbIedsx',
        },
      }
    );
    const data = await response.json();

    const { recordings } = data as { recordings: Recordings[] };

    return res.status(200).json({ recording: recordings[0] });
  }

  return res.status(200).json({ recording });
}
