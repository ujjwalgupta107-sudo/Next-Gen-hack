import connectToDatabase from './db';
import { User, IUser, UserRole } from '../models/User';
import { Session } from '../models/Session';
import { ActivityLog, ActivityAction } from '../models/ActivityLog';
import { hashPassword, comparePassword } from './password';
import {
  signAccessToken,
  generateSecureToken,
  hashToken,
  verifyAccessToken,
  JWTPayload,
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

/**
 * Logs an activity into the MongoDB ActivityLogs collection.
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
  try {
    await connectToDatabase();
    await ActivityLog.create({
      userId: params.userId,
      walletAddress: params.walletAddress?.toLowerCase(),
      action: params.action,
      description: params.description,
      ipAddress: params.ipAddress || '127.0.0.1',
      userAgent: params.userAgent || '',
      metadata: params.metadata || {},
      timestamp: new Date(),
    });
  } catch (err) {
    console.error('Failed to log activity:', err);
  }
}

/**
 * Creates a new refresh session and returns both access and refresh tokens.
 */
export async function createAuthSession(params: {
  user: IUser;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ accessToken: string; refreshToken: string }> {
  await connectToDatabase();
  const user = params.user;

  // 1. Generate JWT Access Token
  const accessToken = signAccessToken({
    userId: user._id.toString(),
    username: user.username,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role,
    verified: user.verified,
  });

  // 2. Generate cryptographically random refresh token
  const refreshToken = generateSecureToken();
  const refreshTokenHash = await hashToken(refreshToken);

  // 3. Store in MongoDB Sessions collection (expires in 30 days)
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
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

  // Update user lastLogin
  user.lastLogin = new Date();
  await user.save();

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
  await connectToDatabase();
  const { username, fullName, email, password, role = 'creator' } = params;

  // Validate inputs
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

  // Check if username or email already exists
  const existingUser = await User.findOne({
    $or: [{ username: cleanUsername }, { email: cleanEmail }],
  });

  if (existingUser) {
    if (existingUser.username === cleanUsername) {
      return { success: false, error: 'Username is already taken', statusCode: 409 };
    }
    return { success: false, error: 'Email is already registered', statusCode: 409 };
  }

  // Hash password using bcrypt
  const passwordHash = await hashPassword(password);

  // Generate email verification token (valid for 24 hours)
  const rawVerifyToken = generateSecureToken();
  const emailVerificationToken = await hashToken(rawVerifyToken);
  const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

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

  // Create session
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
}

/**
 * Authenticates a user with email and password.
 */
export async function loginWithEmail(params: {
  loginIdentifier: string; // Email or Username
  password: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  await connectToDatabase();
  const identifier = params.loginIdentifier.trim().toLowerCase();

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }],
  });

  if (!user || !user.passwordHash) {
    return { success: false, error: 'Invalid email/username or password', statusCode: 401 };
  }

  const isValid = await comparePassword(params.password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: 'Invalid email/username or password', statusCode: 401 };
  }

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
  await connectToDatabase();
  const address = params.walletAddress.trim().toLowerCase();

  // 1. Verify SIWE signature cryptographically
  const verification = verifySIWESignature({
    message: params.message,
    signature: params.signature,
    expectedAddress: address,
  });

  if (!verification.valid) {
    return { success: false, error: verification.error || 'Invalid cryptographic signature', statusCode: 401 };
  }

  // 2. Check if user with this wallet exists in MongoDB
  let user = await User.findOne({ walletAddress: address });

  // 3. If first-time wallet login, auto-provision user profile
  if (!user) {
    const shortAddr = address.substring(2, 8);
    let generatedUsername = `creator_${shortAddr}`;
    
    // Ensure uniqueness
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
      verified: true, // Wallet signature automatically verifies proof-of-key
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
    // If user existed, mark verified since they own the private key
    if (!user.verified) {
      user.verified = true;
      await user.save();
    }
  }

  // 4. Create Session and issue Tokens
  const { accessToken, refreshToken } = await createAuthSession({
    user,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await recordActivity({
    userId: user._id,
    walletAddress: address,
    action: 'siwe_login',
    description: `User ${user.username} authenticated via MetaMask SIWE`,
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

/**
 * Rotates a refresh token: invalidates old token and returns fresh access + refresh tokens.
 */
export async function rotateSessionToken(params: {
  rawRefreshToken: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuthResult> {
  await connectToDatabase();
  const tokenHash = await hashToken(params.rawRefreshToken);

  const session = await Session.findOne({
    refreshTokenHash: tokenHash,
    isValid: true,
  }).populate('userId');

  if (!session || !session.userId || new Date() > session.expiresAt) {
    return { success: false, error: 'Session expired or invalid', statusCode: 401 };
  }

  // Invalidate old session (Token Rotation Defense against reuse)
  session.isValid = false;
  await session.save();

  const user = session.userId as any as IUser;

  // Create new session
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

/**
 * Revokes a session on logout.
 */
export async function revokeAuthSession(rawRefreshToken?: string): Promise<boolean> {
  if (!rawRefreshToken) return false;
  try {
    await connectToDatabase();
    const tokenHash = await hashToken(rawRefreshToken);
    await Session.updateOne({ refreshTokenHash: tokenHash }, { $set: { isValid: false } });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initiates a password reset flow. Generates a secure token.
 */
export async function initiatePasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  await connectToDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const user = await User.findOne({ email: cleanEmail });

  if (!user) {
    // Return success: true to prevent email enumeration attacks
    return { success: true };
  }

  const rawToken = generateSecureToken();
  const resetPasswordToken = await hashToken(rawToken);
  const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordExpires = resetPasswordExpires;
  await user.save();

  return { success: true, token: rawToken };
}

/**
 * Resets user password using the provided reset token.
 */
export async function completePasswordReset(params: {
  token: string;
  newPassword: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();
  const tokenHash = await hashToken(params.token);

  const user = await User.findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return { success: false, error: 'Password reset token is invalid or has expired' };
  }

  if (params.newPassword.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long' };
  }

  user.passwordHash = await hashPassword(params.newPassword);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  // Invalidate all active sessions for security
  await Session.updateMany({ userId: user._id }, { $set: { isValid: false } });

  await recordActivity({
    userId: user._id,
    action: 'change_password',
    description: 'Password reset completed via token',
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return { success: true };
}

/**
 * Verifies email using verification token.
 */
export async function completeEmailVerification(token: string): Promise<{ success: boolean; error?: string }> {
  await connectToDatabase();
  const tokenHash = await hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  });

  if (!user) {
    return { success: false, error: 'Email verification link is invalid or has expired' };
  }

  user.verified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return { success: true };
}
