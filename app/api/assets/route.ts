import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";
import { validateSIWERequest } from "@/app/lib/auth";
import { z } from "zod";

const hashStringSchema = z.string().transform((val) => val.startsWith("0x") ? val.slice(2).toLowerCase() : val.toLowerCase()).pipe(z.string().length(64));

const AssetSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().default(""),
  contentType: z.string().min(1),
  fileMetadata: z.object({
    name: z.string(),
    mimeType: z.string(),
    size: z.number().nonnegative(),
  }),
  fingerprints: z.object({
    sha256: hashStringSchema,
    sha3: z.string().optional(),
    blake3: z.string().optional(),
    phash: z.string().optional(),
    aiHash: z.string().optional(),
  }),
  ipfsCID: z.string().min(1),
  thumbnailCID: z.string().optional(),
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/i, "Invalid Ethereum address"),
  blockchain: z.object({
    txHash: z.string().optional(),
    blockNumber: z.number().optional(),
    timestamp: z.number().optional(),
    chain: z.string().optional().default("Polygon Amoy"),
    gasUsed: z.string().optional(),
  }).optional(),
  status: z.enum(['pending', 'registered', 'disputed']).optional().default('registered'),
  nftTokenId: z.number().nullable().optional(),
  verificationCount: z.number().optional().default(0),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    // Get owner address from query if specified
    const url = new URL(req.url);
    const owner = url.searchParams.get("owner");
    
    const query = owner ? { ownerAddress: new RegExp(`^${owner}$`, "i") } : {};
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

    // SIWE Cryptographic Verification
    const authCheck = validateSIWERequest(req, parsed.data.ownerAddress);
    if (!authCheck.authorized) {
      return NextResponse.json({ error: "Unauthorized: Invalid or missing SIWE signature", details: authCheck.error }, { status: 401 });
    }

    // Check for duplicate asset hash
    const existing = await Asset.findOne({ "fingerprints.sha256": parsed.data.fingerprints.sha256 });
    if (existing) {
      return NextResponse.json(existing, { status: 200 });
    }
    
    const newAsset = new Asset(parsed.data);
    await newAsset.save();
    
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
