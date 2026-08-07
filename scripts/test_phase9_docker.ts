import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log("================================================================================");
console.log("             PHASE 9 — DOCKER ARCHITECTURE, NETWORKING & VOLUMES AUDIT           ");
console.log("================================================================================");

const rootDir = process.cwd();
let passed = 0;
let total = 0;

function verify(name: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ [DOCKER] ${name}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ [DOCKER FAIL] ${name}: ${err.message}`);
    throw err;
  }
}

// 1. Frontend Multi-stage Dockerfile
verify("Frontend Multi-Stage Dockerfile Security & Optimization", () => {
  const content = fs.readFileSync(path.join(rootDir, 'Dockerfile'), 'utf8');
  assert.ok(content.includes('FROM node:20-alpine AS builder'), "Must use alpine node 20 builder");
  assert.ok(content.includes('FROM node:20-alpine AS runner'), "Must use isolated runner stage");
  assert.ok(content.includes('EXPOSE 3000'), "Must expose port 3000");
  assert.ok(content.includes('NODE_ENV=production'), "Must run in production mode");
});

// 2. Backend Neural Engine Dockerfile
verify("Backend Python Neural Engine Dockerfile & System Dependencies", () => {
  const content = fs.readFileSync(path.join(rootDir, 'backend', 'Dockerfile'), 'utf8');
  assert.ok(content.includes('FROM python:3.10-slim'), "Must use python 3.10 slim image");
  assert.ok(content.includes('libgl1-mesa-glx') || content.includes('libglib2.0-0'), "Must include OpenCV native graphical libraries");
  assert.ok(content.includes('EXPOSE 8000'), "Must expose port 8000");
  assert.ok(content.includes('uvicorn'), "Must launch with uvicorn ASGI");
});

// 3. Docker Compose Orchestration & Healthchecks
verify("Docker Compose Multi-Container Orchestration & Volumes", () => {
  const compose = fs.readFileSync(path.join(rootDir, 'docker-compose.yml'), 'utf8');
  assert.ok(compose.includes('frontend:'), "Frontend service defined");
  assert.ok(compose.includes('backend:'), "Backend service defined");
  assert.ok(compose.includes('mongo:'), "MongoDB service defined");
  assert.ok(compose.includes('mongodb_data:'), "Persistent volume for MongoDB defined");
  assert.ok(compose.includes('vector_data:'), "Persistent volume for FAISS vectors defined");
  assert.ok(compose.includes('healthcheck:'), "MongoDB healthcheck defined");
  assert.ok(compose.includes('restart: always'), "Self-healing auto-restart configured");
});

console.log(`\n================================================================================`);
console.log(`  ✓ PHASE 9 COMPLETED: ${passed}/${total} DOCKER CONFIGURATION CHECKS PASSED`);
console.log(`================================================================================\n`);
