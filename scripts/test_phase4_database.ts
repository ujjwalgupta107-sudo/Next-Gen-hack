import assert from 'assert';
import { User, Asset, NFT, License, Verification, VerificationLog, ActivityLog, Session, APIKey, Notification } from '../app/models/index';
import { registerWithEmail, loginWithEmail, recordActivity, createAuthSession } from '../app/lib/auth-service';

console.log("================================================================================");
console.log("             PHASE 4 — DATABASE SCHEMAS, MODELS & RESILIENCE AUDIT              ");
console.log("================================================================================");

let passed = 0;
let total = 0;

function verify(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  ✓ [DATABASE] ${name}`);
        passed++;
      }).catch((err) => {
        console.error(`  ✗ [DATABASE FAIL] ${name}: ${err.message}`);
        throw err;
      });
    }
    console.log(`  ✓ [DATABASE] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ [DATABASE FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

async function runPhase4() {
  // 1. Check all Mongoose Models are exported and valid
  verify("Mongoose Model Schema Definitions & Compilation", () => {
    assert.ok(User, "User model must be compiled");
    assert.ok(Asset, "Asset model must be compiled");
    assert.ok(NFT, "NFT model must be compiled");
    assert.ok(License, "License model must be compiled");
    assert.ok(Verification, "Verification model must be compiled");
    assert.ok(VerificationLog, "VerificationLog model must be compiled");
    assert.ok(ActivityLog, "ActivityLog model must be compiled");
    assert.ok(Session, "Session model must be compiled");
    assert.ok(APIKey, "APIKey model must be compiled");
    assert.ok(Notification, "Notification model must be compiled");
  });

  // 2. Check User Schema constraints and index properties
  verify("User Schema Unique Constraints & Sparse Multi-Auth Indexes", () => {
    const schema = User.schema;
    const usernamePath = schema.path('username') as any;
    const emailPath = schema.path('email') as any;
    const walletPath = schema.path('walletAddress') as any;
    
    assert.ok(usernamePath.options.required, "Username must be required");
    assert.ok(usernamePath.options.unique, "Username must have unique constraint");
    assert.strictEqual(emailPath.options.unique, true, "Email must have unique constraint");
    assert.strictEqual(emailPath.options.sparse, true, "Email must be sparse for SIWE users");
    assert.strictEqual(walletPath.options.unique, true, "Wallet must have unique constraint");
    assert.strictEqual(walletPath.options.sparse, true, "Wallet must be sparse for email users");
  });

  // 3. Check Asset Schema constraints
  verify("Asset Schema Cryptographic Hash Indexes", () => {
    const schema = Asset.schema;
    const sha256Path = schema.path('fingerprints.sha256') as any;
    assert.ok(sha256Path, "Asset must index sha256 fingerprint");
  });

  // 4. Test Resilient Storage Layer Operations (User Registration & Activity Logging)
  await verify("Resilient DB Persistence: User Registration & Duplicate Rejection", async () => {
    const testUsername = `db_user_${Date.now().toString().slice(-4)}`;
    const testEmail = `${testUsername}@proofvault.ai`;
    
    const regResult = await registerWithEmail({
      username: testUsername,
      fullName: "Database Audit User",
      email: testEmail,
      password: "StrongPassword123!",
      role: "creator"
    });
    
    assert.strictEqual(regResult.success, true, regResult.error);
    assert.ok(regResult.user?.id, "User ID must be returned");

    // Attempt Duplicate Registration
    const dupResult = await registerWithEmail({
      username: testUsername,
      fullName: "Duplicate User",
      email: testEmail,
      password: "StrongPassword123!",
      role: "creator"
    });
    assert.strictEqual(dupResult.success, false, "Duplicate registration must be rejected");
  });

  // 5. Test Activity Logging
  await verify("Resilient Activity Log Audit Record Storage", async () => {
    await recordActivity({
      userId: "audit-user-001",
      action: "register_asset",
      ipAddress: "127.0.0.1",
      userAgent: "ProofVault Test Runner",
      details: { assetId: "asset-001", sha256: "0x12345" }
    });
  });

  console.log(`\n================================================================================`);
  console.log(`  ✓ PHASE 4 COMPLETED: ${passed}/${total} DATABASE CHECKS PASSED`);
  console.log(`================================================================================\n`);
}

runPhase4().catch((err) => {
  console.error("Phase 4 Suite Failed:", err);
  process.exit(1);
});
