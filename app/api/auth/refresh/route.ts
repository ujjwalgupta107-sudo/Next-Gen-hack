import { NextRequest, NextResponse } from 'next/server';
import { rotateSessionToken } from '@/app/lib/auth-service';
import { REFRESH_COOKIE_NAME, AUTH_COOKIE_NAME, COOKIE_OPTIONS } from '@/app/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const rawRefreshToken =
      req.cookies.get(REFRESH_COOKIE_NAME)?.value || (await req.json().catch(() => ({}))).refreshToken;

    if (!rawRefreshToken) {
      return NextResponse.json({ error: 'Missing refresh token' }, { status: 401 });
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const result = await rotateSessionToken({
      rawRefreshToken,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
    });

    if (!result.success) {
      const resp = NextResponse.json({ error: result.error }, { status: 401 });
      resp.cookies.delete(AUTH_COOKIE_NAME);
      resp.cookies.delete(REFRESH_COOKIE_NAME);
      return resp;
    }

    const response = NextResponse.json({
      message: 'Token rotated successfully',
      user: result.user,
      accessToken: result.accessToken,
    });

    if (result.accessToken) {
      response.cookies.set(AUTH_COOKIE_NAME, result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60,
      });
    }

    if (result.refreshToken) {
      response.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60,
      });
    }

    return response;
  } catch (err: any) {
    console.error('Refresh error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
