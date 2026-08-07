import { execSync } from 'child_process';
import path from 'path';

console.log("================================================================================");
console.log(" 🚀 PROOFVAULT AI — PRODUCTION RELEASE CANDIDATE AUDIT & TEST SUITE RUNNER       ");
console.log("================================================================================");

const rootDir = process.cwd();

const suites = [
  { name: "Phase 1: Project Health Check", cmd: "node scripts/test_phase1_health.mjs" },
  { name: "Phase 2: Frontend Pages & API Routes", cmd: "npx tsx scripts/test_phase2_frontend.ts" },
  { name: "Phase 3: FastAPI Backend & Neural API", cmd: "python scripts/test_phase3_backend.py" },
  { name: "Phase 4: Database Schemas & Models", cmd: "npx tsx scripts/test_phase4_database.ts" },
  { name: "Phase 5: Smart Contracts Security (Hardhat)", cmd: "node scripts/test_phase5_blockchain.mjs" },
  { name: "Phase 6: AI Perceptual Hashing & FAISS", cmd: "python scripts/test_phase6_ai.py" },
  { name: "Phase 7: IPFS & Decentralized Storage", cmd: "npx tsx scripts/test_phase7_ipfs.ts" },
  { name: "Phase 8: Authentication & SIWE Cryptography", cmd: "npx tsx scripts/test_phase8_auth.ts" },
  { name: "Phase 9: Docker & Containerization", cmd: "npx tsx scripts/test_phase9_docker.ts" },
  { name: "Phase 10: Security & Penetration Testing", cmd: "npx tsx scripts/test_phase10_security.ts" },
  { name: "Phase 11: End-to-End Master Lifecycle (17 Steps)", cmd: "cd blockchain && npx hardhat run scripts/test_phase11_e2e.js" },
  { name: "Phase 12: System Performance & Latency", cmd: "npx tsx scripts/test_phase12_performance.ts" },
];

const results = [];

for (const suite of suites) {
  console.log(`\n================================================================================`);
  console.log(`▶ RUNNING: ${suite.name}`);
  console.log(`================================================================================`);
  const startTime = Date.now();
  try {
    const output = execSync(suite.cmd, { cwd: rootDir, encoding: 'utf8' });
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(output.trim());
    results.push({ name: suite.name, status: "PASSED", elapsed: `${elapsed}s` });
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`  ✗ [FAILED] ${suite.name} in ${elapsed}s`);
    console.error(err.stdout || err.message);
    results.push({ name: suite.name, status: "FAILED", elapsed: `${elapsed}s`, error: err.message });
  }
}

console.log("\n================================================================================");
console.log("             COMPREHENSIVE AUDIT & TEST SUITE RESULTS MATRIX                     ");
console.log("================================================================================");
console.table(results);

const allPassed = results.every(r => r.status === "PASSED");
if (allPassed) {
  console.log("\n  🎯 ALL 12 AUDIT PHASES PASSED WITH 100% SUCCESS — PRODUCTION READY!");
} else {
  console.error("\n  ❌ SOME AUDIT PHASES FAILED!");
  process.exit(1);
}
