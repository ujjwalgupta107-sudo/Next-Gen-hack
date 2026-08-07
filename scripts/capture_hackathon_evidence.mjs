import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log("================================================================================");
console.log(" 🔍 INDEPENDENT RELEASE MANAGER — LIVE HACKATHON AUDIT & EVIDENCE CAPTURE       ");
console.log("================================================================================");

const rootDir = process.cwd();
const evidence = {
  timestamp: new Date().toISOString(),
  sections: {}
};

// SECTION 1: FRONTEND EVIDENCE
console.log("\n[EVIDENCE 1] Validating Frontend Production Build & Route Map...");
const buildStart = Date.now();
const buildLog = execSync("npm run build", { cwd: rootDir, encoding: 'utf8' });
evidence.sections.frontend = {
  buildTimeMs: Date.now() - buildStart,
  routesCount: (buildLog.match(/├|└/g) || []).length,
  status: "BUILD_SUCCESS",
  logSnippet: buildLog.split('\n').filter(l => l.includes('Route (app)') || l.includes('├') || l.includes('└') || l.includes('Compiled')).join('\n')
};
console.log(evidence.sections.frontend.logSnippet);

// SECTION 2: SMART CONTRACT LIVE DEPLOYMENT & BLOCKCHAIN EVIDENCE
console.log("\n[EVIDENCE 2] Compiling and Executing Smart Contracts on Hardhat EVM...");
const hardhatLog = execSync("npx hardhat test", { cwd: path.join(rootDir, 'blockchain'), encoding: 'utf8' });
evidence.sections.blockchain = {
  contracts: ["OwnershipRegistry.sol", "ProofNFT.sol", "Licensing.sol"],
  testCount: (hardhatLog.match(/√/g) || []).length,
  logSnippet: hardhatLog.split('\n').filter(l => l.includes('passing') || l.includes('√')).slice(0, 15).join('\n')
};
console.log(evidence.sections.blockchain.logSnippet);

// SECTION 3: FASTAPI & AI NEURAL ENGINE EVIDENCE
console.log("\n[EVIDENCE 3] Running Live AI Inference & FAISS Vector Search Suite...");
const aiLog = execSync("python scripts/test_phase6_ai.py", { cwd: rootDir, encoding: 'utf8' });
evidence.sections.ai = {
  models: ["CLIP ViT-B/32 (512d)", "Sentence-Transformers all-MiniLM-L6-v2 (384d)", "FAISS IndexFlatIP"],
  logSnippet: aiLog.split('\n').filter(l => l.includes('[PASS]') || l.includes('Neural')).join('\n')
};
console.log(evidence.sections.ai.logSnippet);

// SECTION 4: FULL MASTER END-TO-END DEMO EXECUTION
console.log("\n[EVIDENCE 4] Executing Live 17-Step End-to-End Hackathon Demo...");
const demoLog = execSync("npx hardhat run scripts/test_phase11_e2e.js", { cwd: path.join(rootDir, 'blockchain'), encoding: 'utf8' });
evidence.sections.e2eDemo = {
  logSnippet: demoLog.split('\n').filter(l => l.includes('▶') || l.includes('✓') || l.includes('🎯')).join('\n')
};
console.log(evidence.sections.e2eDemo.logSnippet);

// SECTION 5: SAVE AUDIT EVIDENCE JSON
fs.writeFileSync(path.join(rootDir, 'live_audit_evidence.json'), JSON.stringify(evidence, null, 2), 'utf8');
console.log("\n================================================================================");
console.log("  ✓ ALL AUDIT EVIDENCE COMPILED INTO live_audit_evidence.json");
console.log("================================================================================\n");
