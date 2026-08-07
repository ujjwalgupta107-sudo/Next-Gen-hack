import { NextRequest, NextResponse } from 'next/server';
import { completeEmailVerification } from '@/app/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required' }, { status: 400 });
    }

    const result = await completeEmailVerification(token);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Email verified successfully!' });
  } catch (err: any) {
    console.error('Email verification error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
      return NextResponse.redirect(new URL('/auth/login?verified=false&error=MissingToken', req.url));
    }

    const result = await completeEmailVerification(token);
    if (!result.success) {
      return NextResponse.redirect(new URL(`/auth/login?verified=false&error=${encodeURIComponent(result.error || '')}`, req.url));
    }

    return NextResponse.redirect(new URL('/auth/login?verified=true', req.url));
  } catch {
    return NextResponse.redirect(new URL('/auth/login?verified=false', req.url));
  }
}
