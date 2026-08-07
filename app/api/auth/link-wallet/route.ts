import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import { User } from '@/app/models/User';
import { verifyAccessToken, AUTH_COOKIE_NAME } from '@/app/lib/jwt';
import { verifySIWESignature } from '@/app/lib/auth';
import { recordActivity } from '@/app/lib/auth-service';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(AUTH_COOKIE_NAME)?.value || req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    const payload = token ? verifyAccessToken(token) : null;

    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message, signature, walletAddress } = await req.json();
    if (!message || !signature || !walletAddress) {
      return NextResponse.json({ error: 'Missing SIWE signature parameters' }, { status: 400 });
    }

    const address = walletAddress.trim().toLowerCase();

    // Verify SIWE signature
    const verification = verifySIWESignature({
      message,
      signature,
      expectedAddress: address,
    });

    if (!verification.valid) {
      return NextResponse.json({ error: verification.error || 'Invalid signature' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if wallet is already linked to another account
    const existing = await User.findOne({ walletAddress: address, _id: { $ne: payload.userId } });
    if (existing) {
      return NextResponse.json({ error: 'This wallet address is already linked to another account' }, { status: 409 });
    }

    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    user.walletAddress = address;
    user.verified = true;
    await user.save();

    await recordActivity({
      userId: user._id,
      walletAddress: address,
      action: 'link_wallet',
      description: `Linked wallet address ${address}`,
    });

    return NextResponse.json({
      message: 'Wallet linked successfully',
      walletAddress: address,
    });
  } catch (err: any) {
    console.error('Link wallet error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
