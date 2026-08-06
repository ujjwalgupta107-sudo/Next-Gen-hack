import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";

import { z } from "zod";

const AssetSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  contentType: z.string().min(1),
  fileMetadata: z.object({
    name: z.string(),
    mimeType: z.string(),
    size: z.number().positive(),
  }),
  fingerprints: z.object({
    sha256: z.string().length(64),
    sha3: z.string().length(64).optional(),
    blake3: z.string().length(64).optional(),
    aiHash: z.string().optional(),
  }),
  ipfsCID: z.string().optional(),
  thumbnailCID: z.string().optional(),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get owner address from query if specified
    const url = new URL(req.url);
    const owner = url.searchParams.get("owner");
    
    const query = owner ? { ownerAddress: owner } : {};
    const assets = await Asset.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.error("Fetch assets error:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();
    
    const parsed = AssetSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
    }
    
    const newAsset = new Asset(parsed.data);
    await newAsset.save();
    
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}

