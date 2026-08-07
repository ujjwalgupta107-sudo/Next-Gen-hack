import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";
import { validateSIWERequest } from "@/app/lib/auth";

function normalizeHash(hash: string): string {
  const clean = hash.trim().toLowerCase();
  return clean.startsWith("0x") ? clean.slice(2) : clean;
}

export async function GET(req: NextRequest, context: { params: Promise<{ sha256: string }> }) {
  try {
    await connectToDatabase();
    const { sha256 } = await context.params;
    const cleanSha256 = normalizeHash(sha256);
    
    const asset = await Asset.findOne({ "fingerprints.sha256": cleanSha256 });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset, { status: 200 });
  } catch (error) {
    console.error("Fetch asset error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ sha256: string }> }) {
  try {
    await connectToDatabase();
    const { sha256 } = await context.params;
    const cleanSha256 = normalizeHash(sha256);
    const updateData = await req.json();
    
    const existing = await Asset.findOne({ "fingerprints.sha256": cleanSha256 });
    if (!existing) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // SIWE Authorization Check on Asset Update
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
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
