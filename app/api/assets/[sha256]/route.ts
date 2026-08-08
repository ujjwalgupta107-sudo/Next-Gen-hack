import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";
import { validateSIWERequest } from "@/app/lib/auth";

const DATA_DIR = path.join(process.cwd(), '.proofvault_data');
const ASSETS_FILE = path.join(DATA_DIR, 'assets.json');

function readLocalAssets(): any[] {
  try {
    if (!fs.existsSync(ASSETS_FILE)) return [];
    return JSON.parse(fs.readFileSync(ASSETS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalAssets(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ASSETS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local assets:', err);
  }
}

function normalizeHash(hash: string): string {
  const clean = hash.trim().toLowerCase();
  return clean.startsWith("0x") ? clean.slice(2) : clean;
}

export async function GET(req: NextRequest, context: { params: Promise<{ sha256: string }> }) {
  try {
    const { sha256 } = await context.params;
    const cleanSha256 = normalizeHash(sha256);
    
    const db = await connectToDatabase();
    if (db) {
      try {
        const asset = await Asset.findOne({ "fingerprints.sha256": cleanSha256 });
        if (asset) return NextResponse.json(asset, { status: 200 });
      } catch (err) {
        console.warn("MongoDB fetch asset by hash failed, checking local store:", err);
      }
    }
    
    const local = readLocalAssets();
    const found = local.find((a) => normalizeHash(a.fingerprints?.sha256 || '') === cleanSha256);
    if (!found) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(found, { status: 200 });
  } catch (error) {
    console.error("Fetch asset error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ sha256: string }> }) {
  try {
    const { sha256 } = await context.params;
    const cleanSha256 = normalizeHash(sha256);
    const updateData = await req.json();
    
    const db = await connectToDatabase();
    if (db) {
      try {
        const existing = await Asset.findOne({ "fingerprints.sha256": cleanSha256 });
        if (existing) {
          const authCheck = validateSIWERequest(req, existing.ownerAddress);
          if (!authCheck.authorized) {
            return NextResponse.json({ error: "Unauthorized: Only asset owner can modify asset record", details: authCheck.error }, { status: 401 });
          }
          const asset = await Asset.findOneAndUpdate(
            { "fingerprints.sha256": cleanSha256 },
            { $set: updateData },
            { new: true }
          );
          return NextResponse.json(asset, { status: 200 });
        }
      } catch (err) {
        console.warn("MongoDB patch asset failed, checking local store:", err);
      }
    }

    const local = readLocalAssets();
    const idx = local.findIndex((a) => normalizeHash(a.fingerprints?.sha256 || '') === cleanSha256);
    if (idx === -1) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const existingLocal = local[idx];
    const authCheck = validateSIWERequest(req, existingLocal.ownerAddress);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized: Only asset owner can modify asset record", details: authCheck.error }, { status: 401 });
    }

    local[idx] = { ...existingLocal, ...updateData, updatedAt: new Date().toISOString() };
    writeLocalAssets(local);

    return NextResponse.json(local[idx], { status: 200 });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
