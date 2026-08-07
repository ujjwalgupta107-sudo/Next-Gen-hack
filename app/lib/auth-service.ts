import fs from 'fs';
import path from 'path';
import connectToDatabase from './db';
import { User, IUser, UserRole } from '../models/User';
import { Session } from '../models/Session';
import { ActivityLog, ActivityAction } from '../models/ActivityLog';
import { hashPassword, comparePassword } from './password';
import {
  signAccessToken,
  generateSecureToken,
  hashToken,
} from './jwt';
import { verifySIWESignature } from './auth';

export interface AuthResult {
  success: boolean;
  user?: Partial<IUser> & { id: string };
  accessToken?: string;
  refreshToken?: string;
  error?: string;
  statusCode?: number;
}

// ------------------------------------------------------------------------------
// RESILIENT LOCAL STORE (Active whenever MongoDB is offline)
// ------------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), '.proofvault_data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const ACTIVITY_FILE = path.join(DATA_DIR, 'activity.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readLocalData<T>(file: string, fallback: T): T {
  try {
    ensureDataDir();
    if (!fs.existsSync(file)) return fallback;
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  } catch {
    return fallback;
  }
}

function writeLocalData(file: string, data: any) {
  try {
    ensureDataDir();
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local data:', err);
  }
}

/**
 * Logs an activity into MongoDB (or persistent local store if offline).
 */
export async function recordActivity(params: {
  userId?: any;
  walletAddress?: string;
  action: ActivityAction;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}) {
  const db = await connectToDatabase();
  const entry = {
    userId: params.userId?.toString() || 'local_user',
    walletAddress: params.walletAddress?.toLowerCase(),
    action: params.action,
    description: params.description,
    ipAddress: params.ipAddress || '127.0.0.1',
    userAgent: params.userAgent || '',
    metadata: params.metadata || {},
    timestamp: new Date().toISOString(),
  };

  if (db) {
    try {
      await ActivityLog.create(entry);
      return;
    } catch {
      // Fallback
    }
  }

  // Local file fallback
  const list = readLocalData<any[]>(ACTIVITY_FILE, []);
  list.unshift(entry);
  writeLocalData(ACTIVITY_FILE, list.slice(0, 100));
}

/**
 * Creates a new refresh session and returns both access and refresh tokens.
 */
export async function createAuthSession(params: {
  user: any;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  const user = params.user;
  const userIdStr = user._id ? user._id.toString() : user.id || user.username;

  // 1. Generate JWT Access Token
  const accessToken = signAccessToken({
    userId: userIdStr,
    username: user.username,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role || 'creator',
    verified: user.verified || false,
  });

  // 2. Generate cryptographically random refresh token
  const refreshToken = generateSecureToken();
  const refreshTokenHash = await hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const db = await connectToDatabase();
  if (db && user._id) {
    try {
      await Session.create({
        userId: user._id,
        refreshTokenHash,
        walletAddress: user.walletAddress?.toLowerCase(),
        userAgent: params.userAgent || '',
        ipAddress: params.ipAddress || '127.0.0.1',
        isValid: true,
        expiresAt,
        lastUsedAt: new Date(),
      });
      user.lastLogin = new Date();
      await user.save();
      return { accessToken, refreshToken };
    } catch {
      // Fall through to local
    }
  }

  // Local storage session fallback
  const sessions = readLocalData<any[]>(SESSIONS_FILE, []);
  sessions.push({
    userId: userIdStr,
    refreshTokenHash,
    walletAddress: user.walletAddress?.toLowerCase(),
    userAgent: params.userAgent || '',
    ipAddress: params.ipAddress || '127.0.0.1',
    isValid: true,
    expiresAt: expiresAt.toISOString(),
    lastUsedAt: new Date().toISOString(),
  });
  writeLocalData(SESSIONS_FILE, sessions);

  // Update user lastLogin locally
  const users = readLocalData<any[]>(USERS_FILE, []);
  const idx = users.findIndex((u) => u.username === user.username);
  if (idx !== -1) {
    users[idx].lastLogin = new Date().toISOString();
    writeLocalData(USERS_FILE, users);
  }

  return { accessToken, refreshToken };
}

/**
 * Registers a new user with email and password.
 */
export async function registerWithEmail(params: {
  username: string;
  fullName: string;
  email: string;
  password: string;
  role?: UserRole;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  const { username, fullName, email, password, role = 'creator' } = params;

  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanUsername.length < 3) {
    return { success: false, error: 'Username must be at least 3 characters', statusCode: 400 };
  }
  if (!cleanEmail.includes('@')) {
    return { success: false, error: 'Valid email is required', statusCode: 400 };
  }
  if (password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long', statusCode: 400 };
  }

  const db = await connectToDatabase();
  const passwordHash = await hashPassword(password);
  const rawVerifyToken = generateSecureToken();
  const emailVerificationToken = await hashToken(rawVerifyToken);
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  if (db) {
    try {
      const existingUser = await User.findOne({
        $or: [{ username: cleanUsername }, { email: cleanEmail }],
      });

      if (existingUser) {
        if (existingUser.username === cleanUsername) {
          return { success: false, error: 'Username is already taken', statusCode: 409 };
        }
        return { success: false, error: 'Email is already registered', statusCode: 409 };
      }

      const newUser = await User.create({
        username: cleanUsername,
        fullName: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        role,
        reputationScore: 100,
        verified: false,
        emailVerificationToken,
        emailVerificationExpires,
      });

      const { accessToken, refreshToken } = await createAuthSession({
        user: newUser,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      await recordActivity({
        userId: newUser._id,
        action: 'signup',
        description: `User ${newUser.username} registered with email`,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      return {
        success: true,
        user: {
          id: newUser._id.toString(),
          username: newUser.username,
          fullName: newUser.fullName,
          email: newUser.email,
          role: newUser.role,
          reputationScore: newUser.reputationScore,
          verified: newUser.verified,
        },
        accessToken,
        refreshToken,
      };
    } catch (err: any) {
      console.warn('MongoDB registration write failed, switching to local store:', err.message);
    }
  }

  // Local storage fallback
  const localUsers = readLocalData<any[]>(USERS_FILE, []);
  if (localUsers.some((u) => u.username === cleanUsername)) {
    return { success: false, error: 'Username is already taken', statusCode: 409 };
  }
  if (localUsers.some((u) => u.email === cleanEmail)) {
    return { success: false, error: 'Email is already registered', statusCode: 409 };
  }

  const newLocalUser = {
    id: `local_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    username: cleanUsername,
    fullName: fullName.trim(),
    email: cleanEmail,
    passwordHash,
    role,
    reputationScore: 100,
    verified: false,
    emailVerificationToken,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
  };

  localUsers.push(newLocalUser);
  writeLocalData(USERS_FILE, localUsers);

  const { accessToken, refreshToken } = await createAuthSession({
    user: newLocalUser,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await recordActivity({
    userId: newLocalUser.id,
    action: 'signup',
    description: `User ${newLocalUser.username} registered with email`,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    success: true,
    user: {
      id: newLocalUser.id,
      username: newLocalUser.username,
      fullName: newLocalUser.fullName,
      email: newLocalUser.email,
      role: newLocalUser.role as UserRole,
      reputationScore: newLocalUser.reputationScore,
      verified: newLocalUser.verified,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates a user with email and password.
 */
export async function loginWithEmail(params: {
  loginIdentifier: string;
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  const identifier = params.loginIdentifier.trim().toLowerCase();
  const db = await connectToDatabase();

  if (db) {
    try {
      const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      });

      if (user && user.passwordHash) {
        const isValid = await comparePassword(params.password, user.passwordHash);
        if (isValid) {
          const { accessToken, refreshToken } = await createAuthSession({
            user,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          });

          await recordActivity({
            userId: user._id,
            action: 'login',
            description: `User ${user.username} logged in via credentials`,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          });

          return {
            success: true,
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
            accessToken,
            refreshToken,
          };
        }
      }
    } catch {
      // Fall through to local
    }
  }

  // Local storage check
  const localUsers = readLocalData<any[]>(USERS_FILE, []);
  const localUser = localUsers.find(
    (u) => u.email === identifier || u.username === identifier
  );

  if (!localUser || !localUser.passwordHash) {
    return { success: false, error: 'Invalid email/username or password', statusCode: 401 };
  }

  const isValid = await comparePassword(params.password, localUser.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid email/username or password', statusCode: 401 };
  }

  const { accessToken, refreshToken } = await createAuthSession({
    user: localUser,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await recordActivity({
    userId: localUser.id,
    action: 'login',
    description: `User ${localUser.username} logged in via credentials`,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    success: true,
    user: {
      id: localUser.id,
      username: localUser.username,
      fullName: localUser.fullName,
      email: localUser.email,
      walletAddress: localUser.walletAddress,
      profileImage: localUser.profileImage,
      bio: localUser.bio,
      role: localUser.role as UserRole,
      reputationScore: localUser.reputationScore,
      verified: localUser.verified,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Authenticates or automatically creates a user via MetaMask EIP-4361 SIWE.
 */
export async function loginWithMetaMaskSIWE(params: {
  message: string;
  signature: string;
  walletAddress: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  const address = params.walletAddress.trim().toLowerCase();

  const verification = verifySIWESignature({
    message: params.message,
    signature: params.signature,
    expectedAddress: address,
  });

  if (!verification.valid) {
    return { success: false, error: verification.error || 'Invalid cryptographic signature', statusCode: 401 };
  }

  const db = await connectToDatabase();
  if (db) {
    try {
      let user = await User.findOne({ walletAddress: address });
      if (!user) {
        const shortAddr = address.substring(2, 8);
        let generatedUsername = `creator_${shortAddr}`;
        let counter = 1;
        while (await User.findOne({ username: generatedUsername })) {
          generatedUsername = `creator_${shortAddr}_${counter++}`;
        }

        user = await User.create({
          username: generatedUsername,
          fullName: `Creator ${address.substring(0, 6)}...${address.substring(38)}`,
          walletAddress: address,
          role: 'creator',
          reputationScore: 100,
          verified: true,
        });

        await recordActivity({
          userId: user._id,
          walletAddress: address,
          action: 'signup',
          description: `New user auto-created via MetaMask SIWE (${address})`,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });
      } else {
        if (!user.verified) {
          user.verified = true;
          await user.save();
        }
      }

      const { accessToken, refreshToken } = await createAuthSession({
        user,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });

      return {
        success: true,
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
        accessToken,
        refreshToken,
      };
    } catch {
      // Fall through to local
    }
  }

  // Local storage SIWE fallback
  const localUsers = readLocalData<any[]>(USERS_FILE, []);
  let localUser = localUsers.find((u) => u.walletAddress === address);

  if (!localUser) {
    const shortAddr = address.substring(2, 8);
    localUser = {
      id: `local_user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: `creator_${shortAddr}`,
      fullName: `Creator ${address.substring(0, 6)}...${address.substring(38)}`,
      walletAddress: address,
      role: 'creator',
      reputationScore: 100,
      verified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    localUsers.push(localUser);
    writeLocalData(USERS_FILE, localUsers);
  }

  const { accessToken, refreshToken } = await createAuthSession({
    user: localUser,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    success: true,
    user: {
      id: localUser.id,
      username: localUser.username,
      fullName: localUser.fullName,
      email: localUser.email,
      walletAddress: localUser.walletAddress,
      profileImage: localUser.profileImage,
      bio: localUser.bio,
      role: localUser.role as UserRole,
      reputationScore: localUser.reputationScore,
      verified: localUser.verified,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Rotates a refresh token.
 */
export async function rotateSessionToken(params: {
  rawRefreshToken: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  const tokenHash = await hashToken(params.rawRefreshToken);
  const db = await connectToDatabase();

  if (db) {
    try {
      const session = await Session.findOne({
        refreshTokenHash: tokenHash,
        isValid: true,
      }).populate('userId');

      if (session && session.userId && new Date() <= session.expiresAt) {
        session.isValid = false;
        await session.save();

        const user = session.userId as any as IUser;
        const { accessToken, refreshToken } = await createAuthSession({
          user,
          ipAddress: params.ipAddress,
          userAgent: params.userAgent,
        });

        return {
          success: true,
          user: {
            id: user._id.toString(),
            username: user.username,
            fullName: user.fullName,
            email: user.email,
            walletAddress: user.walletAddress,
            role: user.role,
            reputationScore: user.reputationScore,
            verified: user.verified,
          },
          accessToken,
          refreshToken,
        };
      }
    } catch {
      // Fall through
    }
  }

  // Local storage rotation
  const sessions = readLocalData<any[]>(SESSIONS_FILE, []);
  const sIdx = sessions.findIndex((s) => s.refreshTokenHash === tokenHash && s.isValid);

  if (sIdx === -1) {
    return { success: false, error: 'Session expired or invalid', statusCode: 401 };
  }

  sessions[sIdx].isValid = false;
  writeLocalData(SESSIONS_FILE, sessions);

  const localUsers = readLocalData<any[]>(USERS_FILE, []);
  const user = localUsers.find((u) => u.id === sessions[sIdx].userId || u.username === sessions[sIdx].userId);

  if (!user) {
    return { success: false, error: 'User not found', statusCode: 401 };
  }

  const { accessToken, refreshToken } = await createAuthSession({
    user,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role as UserRole,
      reputationScore: user.reputationScore,
      verified: user.verified,
    },
    accessToken,
    refreshToken,
  };
}

/**
 * Revokes a session on logout.
 */
export async function revokeAuthSession(rawRefreshToken?: string): Promise<boolean> {
  if (!rawRefreshToken) return false;
  const tokenHash = await hashToken(rawRefreshToken);
  const db = await connectToDatabase();

  if (db) {
    try {
      await Session.updateOne({ refreshTokenHash: tokenHash }, { $set: { isValid: false } });
    } catch {
      // Fall through
    }
  }

  const sessions = readLocalData<any[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex((s) => s.refreshTokenHash === tokenHash);
  if (idx !== -1) {
    sessions[idx].isValid = false;
    writeLocalData(SESSIONS_FILE, sessions);
  }
  return true;
}

/**
 * Initiates password reset.
 */
export async function initiatePasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const rawToken = generateSecureToken();
  const resetPasswordToken = await hashToken(rawToken);
  const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

  const db = await connectToDatabase();
  if (db) {
    try {
      const user = await User.findOne({ email: cleanEmail });
      if (user) {
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = resetPasswordExpires;
        await user.save();
        return { success: true, token: rawToken };
      }
    } catch {
      // Fall through
    }
  }

  const users = readLocalData<any[]>(USERS_FILE, []);
  const uIdx = users.findIndex((u) => u.email === cleanEmail);
  if (uIdx !== -1) {
    users[uIdx].resetPasswordToken = resetPasswordToken;
    users[uIdx].resetPasswordExpires = resetPasswordExpires.toISOString();
    writeLocalData(USERS_FILE, users);
    return { success: true, token: rawToken };
  }

  return { success: true };
}

/**
 * Completes password reset.
 */
export async function completePasswordReset(params: {
  token: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  const tokenHash = await hashToken(params.token);
  const newPasswordHash = await hashPassword(params.newPassword);

  const db = await connectToDatabase();
  if (db) {
    try {
      const user = await User.findOne({
        resetPasswordToken: tokenHash,
        resetPasswordExpires: { $gt: new Date() },
      });
      if (user) {
        user.passwordHash = newPasswordHash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        await Session.updateMany({ userId: user._id }, { $set: { isValid: false } });
        return { success: true };
      }
    } catch {
      // Fall through
    }
  }

  const users = readLocalData<any[]>(USERS_FILE, []);
  const uIdx = users.findIndex((u) => u.resetPasswordToken === tokenHash);
  if (uIdx === -1) {
    return { success: false, error: 'Password reset token is invalid or has expired' };
  }

  users[uIdx].passwordHash = newPasswordHash;
  users[uIdx].resetPasswordToken = null;
  users[uIdx].resetPasswordExpires = null;
  writeLocalData(USERS_FILE, users);
  return { success: true };
}

/**
 * Completes email verification.
 */
export async function completeEmailVerification(token: string): Promise<{ success: boolean; error?: string }> {
  const tokenHash = await hashToken(token);
  const db = await connectToDatabase();

  if (db) {
    try {
      const user = await User.findOne({
        emailVerificationToken: tokenHash,
        emailVerificationExpires: { $gt: new Date() },
      });
      if (user) {
        user.verified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();
        return { success: true };
      }
    } catch {
      // Fall through
    }
  }

  const users = readLocalData<any[]>(USERS_FILE, []);
  const uIdx = users.findIndex((u) => u.emailVerificationToken === tokenHash);
  if (uIdx === -1) {
    return { success: false, error: 'Email verification link is invalid or has expired' };
  }

  users[uIdx].verified = true;
  users[uIdx].emailVerificationToken = null;
  writeLocalData(USERS_FILE, users);
  return { success: true };
}
