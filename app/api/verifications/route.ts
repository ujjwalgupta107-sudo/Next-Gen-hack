import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Verification } from "@/app/models/Verification";
import { z } from "zod";

const VerificationSchema = z.object({
  uploadedHash: z.string().min(1),
  result: z.enum(['exact_match', 'near_match', 'no_match']),
  matchedAssetId: z.string().optional(),
  similarityScore: z.number().optional(),
  verifierAddress: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const url = new URL(req.url);
    const verifier = url.searchParams.get("verifier");

    const query = verifier ? { verifierAddress: new RegExp(`^${verifier}$`, "i") } : {};
    const verifications = await Verification.find(query).populate("matchedAssetId").sort({ timestamp: -1 }).limit(100);

    return NextResponse.json(verifications, { status: 200 });
  } catch (error) {
    console.error("Fetch verifications error:", error);
    return NextResponse.json({ error: "Failed to fetch verifications" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();
    const data = await req.json();

    const parsed = VerificationSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.issues }, { status: 400 });
    }

    const newVerification = new Verification(parsed.data);
    await newVerification.save();

    return NextResponse.json(newVerification, { status: 201 });
  } catch (error) {
    console.error("Create verification record error:", error);
    return NextResponse.json({ error: "Failed to record verification" }, { status: 500 });
  }
}
