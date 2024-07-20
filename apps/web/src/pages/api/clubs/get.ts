import { NextRequest, NextResponse } from 'next/server';
import { CLUBS_API_URL, CLUBS_APP_TOKEN, HEY_USER_AGENT } from '@lensshare/data/constants';
import { object, string, number } from 'zod';
import logger from '@lensshare/lib/logger';

const validationSchema = object({
  club_handle: string().optional(),
  id: string().optional(),
  limit: number().optional(),
  profile_id: string().optional(),
  skip: number().optional()
});

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body) {
    return NextResponse.json({ error: 'No body provided' }, { status: 400 });
  }

  const validation = validationSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  try {
    const accessToken = request.headers.get('x-access-token') as string;
    const response = await fetch(`${CLUBS_API_URL}/fetch-clubs`, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'App-Access-Token': CLUBS_APP_TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': HEY_USER_AGENT,
        'X-Access-Token': accessToken
      },
    });

    logger.info(`Clubs fetched for ${body.club_handle}`);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}