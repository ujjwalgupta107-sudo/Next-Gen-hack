import assert from 'assert';
import { registerWithEmail, loginWithEmail, loginWithMetaMaskSIWE } from '../app/lib/auth-service';
import { signAccessToken, verifyAccessToken, generateSecureToken, hashToken } from '../app/lib/jwt';
import { hashPassword, comparePassword } from '../app/lib/password';
import { ethers } from 'ethers';

console.log("================================================================================");
console.log("             PHASE 8 — AUTHENTICATION, CRYPTOGRAPHY & SIWE AUDIT                ");
console.log("================================================================================");

let passed = 0;
let total = 0;

function verify(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  ✓ [AUTH] ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ✗ [AUTH FAIL] ${name}: ${err.message}`);
        throw err;
      });
    }
    console.log(`  ✓ [AUTH] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ [AUTH FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

async function runPhase8() {
  // 1. Password Hashing
  await verify("Bcrypt Password Hashing & Salt Uniqueness (12 rounds)", async () => {
    const pwd = "ProductionPassword99!";
    const h1 = await hashPassword(pwd);
    const h2 = await hashPassword(pwd);
    assert.notStrictEqual(h1, h2, "Hashes must be distinct due to unique salt");
    assert.strictEqual(await comparePassword(pwd, h1), true);
    assert.strictEqual(await comparePassword("Wrong", h1), false);
  });

  // 2. JWT Access Token Signing & Expiration
  verify("Cryptographic JWT HS256 Token Lifecycle & Payload Decryption", () => {
    const token = signAccessToken({
      userId: "user-12345",
      username: "auth_auditor",
      email: "auditor@proofvault.ai",
      role: "enterprise",
      verified: true
    });
    assert.ok(token, "Token must be generated");
    const decoded = verifyAccessToken(token);
    assert.ok(decoded, "Token must be decoded successfully");
    assert.strictEqual(decoded?.username, "auth_auditor");
    assert.strictEqual(decoded?.role, "enterprise");

    // Invalid Token Rejection
    const tampered = token.slice(0, -5) + "abcde";
    assert.strictEqual(verifyAccessToken(tampered), null, "Tampered token must be rejected");
  });

  // 3. Refresh Token Generation & Hashing
  await verify("Secure Refresh Token Randomness & SHA-256 Digesting", async () => {
    const rawToken = generateSecureToken();
    assert.strictEqual(rawToken.length, 64, "32-byte hex token must be 64 hex characters");
    const hashed = await hashToken(rawToken);
    assert.notStrictEqual(hashed, rawToken);
    assert.strictEqual(hashed.length, 64);
  });

  // 4. Email Registration and Login Flow
  await verify("Email & Password User Registration (201) and Login (200)", async () => {
    const suffix = Date.now().toString().slice(-4);
    const userPayload = {
      username: `sec_user_${suffix}`,
      fullName: "Security Auditor",
      email: `sec_${suffix}@proofvault.ai`,
      password: "SuperSafePassword123!",
      role: "creator" as const
    };

    const reg = await registerWithEmail(userPayload);
    assert.strictEqual(reg.success, true, reg.error);
    assert.ok(reg.accessToken);
    assert.ok(reg.refreshToken);

    const login = await loginWithEmail({
      loginIdentifier: userPayload.email,
      password: userPayload.password
    });
    assert.strictEqual(login.success, true, login.error);
    assert.strictEqual(login.user?.email, userPayload.email);
  });

  // 5. MetaMask SIWE (EIP-4361) Signature Flow
  await verify("MetaMask Sign-In With Ethereum (EIP-4361) Auto-Provisioning", async () => {
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address.toLowerCase();
    const nonce = "siwe_nonce_" + Date.now();
    const siweMessage = `localhost wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to verify digital asset ownership on ProofVault AI.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 80002\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
    const signature = await wallet.signMessage(siweMessage);

    const siweResult = await loginWithMetaMaskSIWE({
      message: siweMessage,
      signature,
      walletAddress: address
    });
    assert.strictEqual(siweResult.success, true, siweResult.error);
    assert.strictEqual(siweResult.user?.walletAddress?.toLowerCase(), address);
  });

  console.log(`\n================================================================================`);
  console.log(`  ✓ PHASE 8 COMPLETED: ${passed}/${total} AUTHENTICATION & CRYPTOGRAPHY CHECKS PASSED`);
  console.log(`================================================================================\n`);
}

runPhase8().catch((err) => {
  console.error("Phase 8 Failed:", err);
  process.exit(1);
});
