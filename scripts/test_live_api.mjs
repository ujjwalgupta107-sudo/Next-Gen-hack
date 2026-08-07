import assert from 'assert';
import { registerWithEmail, loginWithEmail, loginWithMetaMaskSIWE, createAuthSession, recordActivity } from '../app/lib/auth-service.js';
import { ethers } from 'ethers';
import { hashPassword, comparePassword } from '../app/lib/password.js';
import { signAccessToken, verifyAccessToken } from '../app/lib/jwt.js';

console.log("================================================================================");
console.log("             PROOFVAULT AI — END-TO-END AUTHENTICATION INTEGRATION TEST          ");
console.log("================================================================================");

async function runEndToEnd() {
  console.log("\n[STEP 1] Testing User Registration via Email...");
  const testUser = {
    username: `test_creator_${Date.now().toString().slice(-4)}`,
    fullName: "Ujjwal Gupta",
    email: `ujjwal_${Date.now().toString().slice(-4)}@proofvault.ai`,
    password: "StrongPassword123!",
    role: "creator"
  };

  const signupRes = await registerWithEmail(testUser);
  console.log("Signup Result:", signupRes.success ? "SUCCESS (201 Created)" : "FAILED");
  assert.strictEqual(signupRes.success, true, signupRes.error);
  assert.ok(signupRes.accessToken, "Access token must be generated");
  assert.ok(signupRes.refreshToken, "Refresh token must be generated");
  assert.strictEqual(signupRes.user.username, testUser.username);
  console.log(`  ✓ User registered: @${signupRes.user.username} (${signupRes.user.email})`);

  console.log("\n[STEP 2] Testing User Login with Email & Password...");
  const loginRes = await loginWithEmail({
    loginIdentifier: testUser.email,
    password: testUser.password
  });
  console.log("Login Result:", loginRes.success ? "SUCCESS (200 OK)" : "FAILED");
  assert.strictEqual(loginRes.success, true, loginRes.error);
  assert.ok(loginRes.accessToken, "Access token must be returned");
  console.log(`  ✓ Authenticated user: ${loginRes.user.fullName} [Role: ${loginRes.user.role}]`);

  console.log("\n[STEP 3] Testing MetaMask SIWE First-Time Auto-Provisioning...");
  const wallet = ethers.Wallet.createRandom();
  const address = wallet.address.toLowerCase();
  const nonce = "123456789abcdef0";
  const siweMsg = `localhost wants you to sign in with your Ethereum account:\n${address}\n\nSign in with Ethereum to verify digital asset ownership on ProofVault AI.\n\nURI: http://localhost:3000\nVersion: 1\nChain ID: 80002\nNonce: ${nonce}\nIssued At: ${new Date().toISOString()}`;
  const signature = await wallet.signMessage(siweMsg);

  const siweRes = await loginWithMetaMaskSIWE({
    message: siweMsg,
    signature,
    walletAddress: address
  });
  assert.strictEqual(siweRes.success, true, siweRes.error);
  assert.ok(siweRes.user.walletAddress, "Wallet address must be recorded");
  console.log(`  ✓ SIWE Auto-Created User: @${siweRes.user.username} with wallet ${address}`);

  console.log("\n[STEP 4] Testing SIWE Existing User Login...");
  const siweSecondLogin = await loginWithMetaMaskSIWE({
    message: siweMsg,
    signature,
    walletAddress: address
  });
  assert.strictEqual(siweSecondLogin.success, true);
  assert.strictEqual(siweSecondLogin.user.username, siweRes.user.username, "Username must match existing record");
  console.log(`  ✓ Existing SIWE user logged in successfully: @${siweSecondLogin.user.username}`);

  console.log("\n================================================================================");
  console.log("  ✓ ALL AUTHENTICATION STEPS COMPLETED WITH 100% SUCCESS (NO ECONNREFUSED)       ");
  console.log("================================================================================\n");
}

runEndToEnd().catch((err) => {
  console.error("Test Failure:", err);
  process.exit(1);
});
