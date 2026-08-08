import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import connectToDatabase from "@/app/lib/db";
import { Verification } from "@/app/models/Verification";
import { z } from "zod";

const DATA_DIR = path.join(process.cwd(), '.proofvault_data');
const VERIFICATIONS_FILE = path.join(DATA_DIR, 'verifications.json');

function readLocalVerifications(): any[] {
  try {
    if (!fs.existsSync(VERIFICATIONS_FILE)) return [];
    return JSON.parse(fs.readFileSync(VERIFICATIONS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeLocalVerifications(data: any[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(VERIFICATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write local verifications:', err);
  }
}

const VerificationSchema = z.object({
  uploadedHash: z.string().min(1),
  result: z.enum(['exact_match', 'near_match', 'no_match']),
  matchedAssetId: z.string().optional(),
  similarityScore: z.number().optional(),
  verifierAddress: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const verifier = url.searchParams.get("verifier");
    const db = await connectToDatabase();
    
    if (db) {
      try {
        const query = verifier ? { verifierAddress: new RegExp(`^${verifier}$`, "i") } : {};
        const verifications = await Verification.find(query).populate("matchedAssetId").sort({ timestamp: -1 }).limit(100);
        return NextResponse.json(verifications, { status: 200 });
      } catch (err) {
        console.warn("MongoDB fetch verifications failed, reading local store:", err);
      }
    }

    const local = readLocalVerifications();
    const filtered = verifier
      ? local.filter((v) => v.verifierAddress?.toLowerCase() === verifier.toLowerCase())
      : local;
    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const parsed = VerificationSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
    }

    const db = await connectToDatabase();
    if (db) {
      try {
        const newVerification = new Verification(parsed.data);
        await newVerification.save();
        return NextResponse.json(newVerification, { status: 201 });
      } catch (err) {
        console.warn("MongoDB create verification failed, writing to local store:", err);
      }
    }

    const local = readLocalVerifications();
    const newLocalVerification = {
      _id: `verif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ...parsed.data,
      timestamp: new Date().toISOString(),
    };
    local.unshift(newLocalVerification);
    writeLocalVerifications(local.slice(0, 100));

    return NextResponse.json(newLocalVerification, { status: 201 });
  } catch (error) {
    console.error("Create verification record error:", error);
    return NextResponse.json({ error: "Failed to record verification" }, { status: 500 });
  }
}
