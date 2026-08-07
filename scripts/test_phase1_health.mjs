import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log("================================================================================");
console.log("             PHASE 1 — PROJECT HEALTH & CONFIGURATION AUDIT                      ");
console.log("================================================================================");

const rootDir = process.cwd();

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  'Dockerfile',
  'docker-compose.yml',
  '.env',
  '.env.example',
  'README.md',
  'backend/main.py',
  'backend/requirements.txt',
  'backend/Dockerfile',
  'blockchain/package.json',
  'blockchain/hardhat.config.js',
  'blockchain/contracts/OwnershipRegistry.sol',
  'blockchain/contracts/ProofNFT.sol',
  'blockchain/contracts/Licensing.sol'
];

let checksPassed = 0;
let totalChecks = 0;

function check(name, fn) {
  totalChecks++;
  try {
    fn();
    console.log(`  ✓ [HEALTH] ${name}`);
    checksPassed++;
  } catch (err) {
    console.error(`  ✗ [HEALTH FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// 1. Check all required project files exist
check("Required Files & Project Hierarchy Check", () => {
  for (const relPath of requiredFiles) {
    const fullPath = path.join(rootDir, relPath);
    assert.strictEqual(fs.existsSync(fullPath), true, `Missing required file: ${relPath}`);
  }
});

// 2. Check package.json dependencies
check("Node.js Package.json Dependencies Integrity", () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf8'));
  assert.ok(pkg.dependencies['next'], "Next.js must be present");
  assert.ok(pkg.dependencies['react'], "React must be present");
  assert.ok(pkg.dependencies['ethers'], "ethers.js must be present");
  assert.ok(pkg.dependencies['jsonwebtoken'], "jsonwebtoken must be present");
  assert.ok(pkg.dependencies['bcryptjs'], "bcryptjs must be present");
  assert.ok(pkg.dependencies['mongoose'], "mongoose must be present");
});

// 3. Check python requirements.txt
check("Python Backend Requirements.txt Integrity", () => {
  const reqs = fs.readFileSync(path.join(rootDir, 'backend', 'requirements.txt'), 'utf8');
  assert.ok(reqs.includes('fastapi'), "fastapi must be in requirements.txt");
  assert.ok(reqs.includes('uvicorn'), "uvicorn must be in requirements.txt");
  assert.ok(reqs.includes('torch'), "torch must be in requirements.txt");
  assert.ok(reqs.includes('transformers'), "transformers must be in requirements.txt");
  assert.ok(reqs.includes('sentence-transformers'), "sentence-transformers must be in requirements.txt");
  assert.ok(reqs.includes('faiss-cpu'), "faiss-cpu must be in requirements.txt");
});

// 4. Check Docker configs
check("Docker & Docker Compose Structural Check", () => {
  const dockerCompose = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf8');
  assert.ok(dockerCompose.includes('frontend:'), "Frontend service must be in docker-compose.yml");
  assert.ok(dockerCompose.includes('backend:'), "Backend service must be in docker-compose.yml");
  assert.ok(dockerCompose.includes('mongo:'), "Mongo service must be in docker-compose.yml");
});

// 5. Check Environment Variables in .env
check("Environment Variables Configuration (.env)", () => {
  const envContent = fs.readFileSync(path.join(rootDir, '.env'), 'utf8');
  assert.ok(envContent.includes('MONGODB_URI'), "MONGODB_URI must be configured");
  assert.ok(envContent.includes('JWT_SECRET'), "JWT_SECRET must be configured");
  assert.ok(envContent.includes('PRIVATE_KEY'), "PRIVATE_KEY must be configured");
  assert.ok(envContent.includes('NEXT_PUBLIC_REGISTRY_ADDRESS'), "Contract registry address must be configured");
});

// 6. Check TypeScript Config
check("TypeScript tsconfig.json Validity", () => {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(rootDir, 'tsconfig.json'), 'utf8'));
  assert.ok(tsconfig.compilerOptions, "tsconfig must contain compilerOptions");
  assert.strictEqual(tsconfig.compilerOptions.strict, true, "TypeScript strict mode must be enabled");
});

console.log(`\n================================================================================`);
console.log(`  ✓ PHASE 1 COMPLETED: ${checksPassed}/${totalChecks} CHECKS PASSED`);
console.log(`================================================================================\n`);
