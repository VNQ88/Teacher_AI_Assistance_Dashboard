import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export async function POST(request: NextRequest) {
  const { accessToken, refreshToken } = await request.json();

  try {
    await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Referer': refreshToken,
      },
    });
  } catch {
    // proceed regardless
  }

  return NextResponse.json({ success: true });
}
