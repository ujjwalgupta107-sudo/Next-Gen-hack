import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/app/lib/db';
import { User } from '@/app/models/User';
import { Asset } from '@/app/models/Asset';
import { NFT } from '@/app/models/NFT';
import { verifyAccessToken, AUTH_COOKIE_NAME } from '@/app/lib/jwt';
import { hashPassword, comparePassword } from '@/app/lib/password';
import { recordActivity } from '@/app/lib/auth-service';

const DATA_DIR = path.join(process.cwd(), '.proofvault_data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

function readLocalUsers(): any[] {
  try {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalUsers(users: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local users:', err);
  }
}

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

    const db = await connectToDatabase();
    if (db) {
      try {
        const user = await User.findById(payload.userId).select('-passwordHash -emailVerificationToken -resetPasswordToken');
        if (user) {
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
        }
      } catch {
        // Fall through to local
      }
    }

    // Local file fallback
    const localUsers = readLocalUsers();
    const user = localUsers.find(
      (u) => u.id === payload.userId || u.username === payload.username
    );

    if (!user) {
      return NextResponse.json({
        user: {
          id: payload.userId,
          username: payload.username,
          fullName: payload.username,
          email: payload.email,
          walletAddress: payload.walletAddress,
          role: payload.role || 'creator',
          reputationScore: 100,
          verified: payload.verified || false,
          stats: { assets: 0, nfts: 0 },
        }
      });
    }

    return NextResponse.json({
      user: {
        id: user.id,
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
        stats: { assets: 0, nfts: 0 },
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

    const db = await connectToDatabase();
    if (db) {
      try {
        const user = await User.findById(payload.userId);
        if (user) {
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

          if (fullName !== undefined && fullName.trim()) user.fullName = fullName.trim();
          if (bio !== undefined) user.bio = bio.trim();
          if (profileImage !== undefined) user.profileImage = profileImage;

          await user.save();
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
        }
      } catch {
        // Fall through
      }
    }

    // Local file fallback
    const localUsers = readLocalUsers();
    const uIdx = localUsers.findIndex((u) => u.id === payload.userId || u.username === payload.username);

    if (uIdx === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const localUser = localUsers[uIdx];
    if (newPassword) {
      if (localUser.passwordHash) {
        if (!currentPassword) {
          return NextResponse.json({ error: 'Current password is required to set a new password' }, { status: 400 });
        }
        const match = await comparePassword(currentPassword, localUser.passwordHash);
        if (!match) {
          return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
        }
      }

      if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 });
      }

      localUser.passwordHash = await hashPassword(newPassword);
    }

    if (fullName !== undefined && fullName.trim()) localUser.fullName = fullName.trim();
    if (bio !== undefined) localUser.bio = bio.trim();
    if (profileImage !== undefined) localUser.profileImage = profileImage;
    localUser.updatedAt = new Date().toISOString();

    writeLocalUsers(localUsers);

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: localUser.id,
        username: localUser.username,
        fullName: localUser.fullName,
        email: localUser.email,
        walletAddress: localUser.walletAddress,
        profileImage: localUser.profileImage,
        bio: localUser.bio,
        role: localUser.role,
        reputationScore: localUser.reputationScore,
        verified: localUser.verified,
      },
    });
  } catch (err: any) {
    console.error('Update profile error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
