import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud",
});

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_MIME_TYPES = [
  "image/png", "image/jpeg", "image/webp", "image/gif",
  "video/mp4", "video/webm",
  "audio/mpeg", "audio/wav", "audio/ogg",
  "application/pdf", "text/plain"
];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 50MB limit" }, { status: 413 });
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 });
    }

    // Upload to Pinata
    const upload = await pinata.upload.file(file);
    
    return NextResponse.json({ 
      cid: upload.IpfsHash,
      pinSize: upload.PinSize,
      timestamp: upload.Timestamp
    }, { status: 200 });
  } catch (error) {
    console.error("Pinata upload error:", error);
    return NextResponse.json({ error: "Failed to upload to IPFS" }, { status: 500 });
  }
}
