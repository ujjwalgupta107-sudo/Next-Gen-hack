import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import { ActivityLog } from '@/app/models/ActivityLog';
import { verifyAccessToken, AUTH_COOKIE_NAME } from '@/app/lib/jwt';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const logs = await ActivityLog.find({
      $or: [
        { userId: payload.userId },
        ...(payload.walletAddress ? [{ walletAddress: payload.walletAddress.toLowerCase() }] : []),
      ],
    })
      .sort({ timestamp: -1 })
      .limit(50);

    return NextResponse.json({ logs });
  } catch (err: any) {
    console.error('Fetch activity error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
