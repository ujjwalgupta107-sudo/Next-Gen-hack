import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log("================================================================================");
console.log("             PHASE 2 — FRONTEND PAGES, ROUTES & COMPONENTS AUDIT                 ");
console.log("================================================================================");

const rootDir = process.cwd();
let passed = 0;
let total = 0;

function verify(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ [FRONTEND] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ [FRONTEND FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// 1. Check all App Router Page Files exist
const expectedPages = [
  'app/page.tsx',                             // Landing Page
  'app/auth/login/page.tsx',                  // Login Page
  'app/auth/signup/page.tsx',                 // Signup Page
  'app/auth/forgot-password/page.tsx',        // Forgot Password Page
  'app/auth/reset-password/page.tsx',         // Reset Password Page
  'app/auth/verify-email/page.tsx',           // Email Verification Page
  'app/dashboard/page.tsx',                   // Main Dashboard
  'app/dashboard/upload/page.tsx',            // Asset Upload & Minting
  'app/dashboard/verify/page.tsx',            // Verification & Neural Comparison
  'app/dashboard/marketplace/page.tsx',       // License Marketplace
  'app/dashboard/nft/page.tsx',               // NFT Gallery
  'app/dashboard/profile/page.tsx',           // Creator Profile & Reputation
  'app/dashboard/settings/page.tsx',          // Settings & API Keys
  'app/dashboard/analytics/page.tsx',         // Analytics & Verification Logs
  'app/dashboard/assets/page.tsx',            // Asset Registry
  'app/dashboard/licenses/page.tsx'           // License Management
];

verify("App Router Pages Existence & Route Map", () => {
  for (const pagePath of expectedPages) {
    const full = path.join(rootDir, pagePath);
    assert.strictEqual(fs.existsSync(full), true, `Missing frontend page: ${pagePath}`);
    const content = fs.readFileSync(full, 'utf8');
    assert.ok(content.length > 100, `Page ${pagePath} is suspiciously empty`);
  }
});

// 2. Check Global CSS and Tailwind v4 Styling
verify("Global CSS Design System & Theme Variables", () => {
  const css = fs.readFileSync(path.join(rootDir, 'app', 'globals.css'), 'utf8');
  assert.ok(css.includes('--background') || css.includes('@theme') || css.includes('tailwindcss'), "CSS tokens must exist");
  assert.ok(css.length > 500, "globals.css must contain rich style definitions");
});

// 3. Check Dashboard Layout and Navigation
verify("Dashboard Shell Navigation & Sidebar", () => {
  const layout = fs.readFileSync(path.join(rootDir, 'app', 'dashboard', 'layout.tsx'), 'utf8');
  assert.ok(layout.includes('dashboard/upload'), "Layout must link to upload");
  assert.ok(layout.includes('dashboard/verify'), "Layout must link to verify");
  assert.ok(layout.includes('dashboard/marketplace'), "Layout must link to marketplace");
  assert.ok(layout.includes('dashboard/nft'), "Layout must link to nft");
});

// 4. Check API Routes for Assets, Auth, Pinata, Verifications
const expectedApiRoutes = [
  'app/api/auth/signup/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/auth/siwe/route.ts',
  'app/api/auth/me/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/refresh/route.ts',
  'app/api/auth/activity/route.ts',
  'app/api/auth/link-wallet/route.ts',
  'app/api/auth/unlink-wallet/route.ts',
  'app/api/auth/forgot-password/route.ts',
  'app/api/auth/reset-password/route.ts',
  'app/api/auth/verify-email/route.ts',
  'app/api/assets/route.ts',
  'app/api/assets/[sha256]/route.ts',
  'app/api/pinata/upload/route.ts',
  'app/api/pinata/metadata/route.ts',
  'app/api/verifications/route.ts'
];

verify("Next.js App Router API Handlers", () => {
  for (const apiPath of expectedApiRoutes) {
    const full = path.join(rootDir, apiPath);
    assert.strictEqual(fs.existsSync(full), true, `Missing API handler: ${apiPath}`);
    const content = fs.readFileSync(full, 'utf8');
    assert.ok(content.includes('export async function GET') || content.includes('export async function POST'), `API route ${apiPath} must export HTTP methods`);
  }
});

console.log(`\n================================================================================`);
console.log(`  ✓ PHASE 2 COMPLETED: ${passed}/${total} FRONTEND CHECKS PASSED`);
console.log(`================================================================================\n`);
