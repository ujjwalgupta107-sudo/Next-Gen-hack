import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import { User } from '@/app/models/User';
import { Asset } from '@/app/models/Asset';
import { NFT } from '@/app/models/NFT';
import { verifyAccessToken, AUTH_COOKIE_NAME } from '@/app/lib/jwt';
import { hashPassword, comparePassword } from '@/app/lib/password';
import { recordActivity } from '@/app/lib/auth-service';

/**
 * Extracts and verifies JWT from cookie or Bearer header.
 */
function extractUserFromRequest(req: NextRequest) {
  const cookieToken = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const headerToken = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = cookieToken || headerToken;
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function GET(req: NextRequest) {
  try {
    const payload = extractUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized or session expired' }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findById(payload.userId).select('-passwordHash -emailVerificationToken -resetPasswordToken');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Fetch user asset and NFT counts
    const wallet = user.walletAddress?.toLowerCase();
    const assetCount = wallet ? await Asset.countDocuments({ ownerAddress: wallet }) : 0;
    const nftCount = wallet ? await NFT.countDocuments({ ownerAddress: wallet }) : 0;

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        profileImage: user.profileImage,
        bio: user.bio,
        role: user.role,
        reputationScore: user.reputationScore,
        verified: user.verified,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        stats: {
          assets: assetCount,
          nfts: nftCount,
        },
      },
    });
  } catch (err: any) {
    console.error('Fetch me error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const payload = extractUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized or session expired' }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, bio, profileImage, currentPassword, newPassword } = body;

    await connectToDatabase();
    const user = await User.findById(payload.userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. Password Change logic if requested
    if (newPassword) {
      if (user.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
        }
        const match = await comparePassword(currentPassword, user.passwordHash);
        if (!match) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      user.passwordHash = await hashPassword(newPassword);
      await recordActivity({
        userId: user._id,
        action: 'change_password',
        description: 'User changed password from profile settings',
      });
    }

    // 2. Profile Details update
    if (fullName !== undefined && fullName.trim()) user.fullName = fullName.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    await recordActivity({
      userId: user._id,
      action: 'update_profile',
      description: 'User updated profile details',
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        walletAddress: user.walletAddress,
        profileImage: user.profileImage,
        bio: user.bio,
        role: user.role,
        reputationScore: user.reputationScore,
        verified: user.verified,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
