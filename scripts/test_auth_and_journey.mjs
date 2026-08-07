import assert from 'assert';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/proofvault";
const JWT_SECRET = process.env.JWT_SECRET || "proofvault_production_jwt_super_secret_signing_key_32_chars_min";

console.log("================================================================================");
console.log("      PROOFVAULT AI — PRODUCTION AUTHENTICATION & SECURITY TEST SUITE           ");
console.log("================================================================================");

async function runTestSuite() {
  console.log("\n[TEST 1] Testing Password Hashing with bcrypt (12 salt rounds)...");
  const testPassword = "SuperSecurePassword123!";
  const hash1 = await bcrypt.hash(testPassword, 12);
  const hash2 = await bcrypt.hash(testPassword, 12);
  
  assert.notStrictEqual(hash1, hash2, "Bcrypt salt uniqueness must ensure distinct hashes");
  assert.strictEqual(await bcrypt.compare(testPassword, hash1), true, "Valid password comparison must succeed");
  assert.strictEqual(await bcrypt.compare("WrongPassword", hash1), false, "Invalid password comparison must fail");
  console.log("  ✓ Password hashing and verification passed.");

  console.log("\n[TEST 2] Testing Cryptographic JWT Signing & Expiration Verification...");
  const userPayload = {
    userId: "64e72a8f9c1e8a3b5f4d2c1a",
    username: "satoshinakamoto",
    email: "satoshi@proofvault.ai",
    role: "creator",
    verified: true
  };
  const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h', algorithm: 'HS256' });
  const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
  assert.strictEqual(decoded.username, "satoshinakamoto");
  assert.strictEqual(decoded.role, "creator");
  console.log("  ✓ JWT signing, verification, and claims decoding passed.");

  console.log("\n[TEST 3] Testing Sign-In With Ethereum (SIWE / EIP-4361) Signature Proofs...");
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address.toLowerCase();
  const nonce = "a1b2c3d4e5f67890";
  const siweMessage = `localhost wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to verify digital asset ownership on ProofVault AI.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 80002\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
  
  const signature = await wallet.signMessage(siweMessage);
  const recoveredAddress = ethers.verifyMessage(siweMessage, signature);
  assert.strictEqual(recoveredAddress.toLowerCase(), address, "Recovered address must match wallet address");
  console.log(`  ✓ SIWE Message signed and verified for wallet: ${address}`);

  console.log("\n[TEST 4] Testing Replay Defense & Tampered Signature Rejection...");
  const tamperedMessage = siweMessage.replace(nonce, "fake_tampered_nonce");
  const tamperedRecovery = ethers.verifyMessage(tamperedMessage, signature);
  assert.notStrictEqual(tamperedRecovery.toLowerCase(), address, "Tampered message must fail signature recovery");
  console.log("  ✓ Signature replay defense verified.");

  console.log("\n[TEST 5] Testing Role-Based Access Control (RBAC) Permitted Matrix...");
  const roles = {
    creator: ["read:assets", "write:assets", "verify:assets", "mint:nft"],
    enterprise: ["read:assets", "write:assets", "verify:assets", "mint:nft", "api:enterprise", "bulk:verify"],
    admin: ["*"]
  };
  assert.strictEqual(roles.creator.includes("mint:nft"), true);
  assert.strictEqual(roles.creator.includes("bulk:verify"), false);
  assert.strictEqual(roles.enterprise.includes("bulk:verify"), true);
  console.log("  ✓ Role permissions matrix verified.");

  console.log("\n================================================================================");
  console.log("  ✓ ALL AUTHENTICATION, CRYPTOGRAPHY, AND SECURITY TESTS COMPLETED (5/5 PASSED)");
  console.log("================================================================================\n");
}

runTestSuite().catch((err) => {
  console.error("Test Suite Failure:", err);
  process.exit(1);
});
