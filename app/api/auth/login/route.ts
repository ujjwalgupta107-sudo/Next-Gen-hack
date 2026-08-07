import { NextRequest, NextResponse } from 'next/server';
import { loginWithEmail } from '@/app/lib/auth-service';
import { AUTH_COOKIE_NAME, REFRESH_COOKIE_NAME, COOKIE_OPTIONS } from '@/app/lib/jwt';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { loginIdentifier, password } = body;

    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { error: 'Email/Username and Password are required' },
        { status: 400 }
      );
    }

    const ipAddress = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const result = await loginWithEmail({
      loginIdentifier,
      password,
      ipAddress: Array.isArray(ipAddress) ? ipAddress[0] : ipAddress,
      userAgent,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode || 401 });
    }

    const response = NextResponse.json(
      {
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
      },
      { status: 200 }
    );

    // Set secure HTTP-only cookies
    if (result.accessToken) {
      response.cookies.set(AUTH_COOKIE_NAME, result.accessToken, {
        ...COOKIE_OPTIONS,
        maxAge: 60 * 60, // 1 hour
      });
    }

    if (result.refreshToken) {
      response.cookies.set(REFRESH_COOKIE_NAME, result.refreshToken, {
        ...COOKIE_OPTIONS,
        maxAge: 30 * 24 * 60 * 60, // 30 days
      });
    }

    return response;
  } catch (err: any) {
    console.error('Login error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
