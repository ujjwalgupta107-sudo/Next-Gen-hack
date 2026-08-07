import { execSync } from 'child_process';
import path from 'path';

console.log("================================================================================");
console.log("             PHASE 11 — END-TO-END PRODUCTION MASTER LIFECYCLE AUDIT            ");
console.log("================================================================================");

const blockchainDir = path.join(process.cwd(), 'blockchain');
const out = execSync("npx hardhat run scripts/test_phase11_e2e.js", { cwd: blockchainDir, encoding: 'utf8' });
console.log(out.trim());
