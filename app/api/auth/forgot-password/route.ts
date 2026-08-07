import { NextRequest, NextResponse } from 'next/server';
import { initiatePasswordReset } from '@/app/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email address is required' }, { status: 400 });
    }

    const result = await initiatePasswordReset(email);

    // In production, an email service sends this. In local/dev, return token for instant testing
    return NextResponse.json({
      message: 'If the email exists, a password reset link has been dispatched.',
      resetToken: process.env.NODE_ENV !== 'production' ? result.token : undefined,
    });
  } catch (err: any) {
    console.error('Forgot password error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
