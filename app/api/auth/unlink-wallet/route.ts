import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import { User } from '@/app/models/User';
import { verifyAccessToken, AUTH_COOKIE_NAME } from '@/app/lib/jwt';
import { recordActivity } from '@/app/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.email || !user.passwordHash) {
      return NextResponse.json(
        { error: 'Cannot unlink wallet: You must set up an email and password first to prevent lockout' },
        { status: 400 }
      );
    }

    const previousWallet = user.walletAddress;
    user.walletAddress = undefined;
    await user.save();

    await recordActivity({
      userId: user._id,
      walletAddress: previousWallet,
      action: 'unlink_wallet',
      description: `Unlinked wallet address ${previousWallet}`,
    });

    return NextResponse.json({ message: 'Wallet unlinked successfully' });
  } catch (err: any) {
    console.error('Unlink wallet error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
