import { NextRequest, NextResponse } from 'next/server';
import { revokeAuthSession } from '@/app/lib/auth-service';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, COOKIE_OPTIONS } from '@/app/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
    if (rawRefreshToken) {
      await revokeAuthSession(rawRefreshToken);
    }

    const response = NextResponse.json({ message: 'Logged out successfully' });
    response.cookies.delete(AUTH_COOKIE_NAME);
    response.cookies.delete(REFRESH_COOKIE_NAME);

    // Explicitly expire cookie headers
    response.cookies.set(AUTH_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });
    response.cookies.set(REFRESH_COOKIE_NAME, '', { ...COOKIE_OPTIONS, maxAge: 0 });

    return response;
  } catch (err: any) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
