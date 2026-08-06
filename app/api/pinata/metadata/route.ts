import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT || "",
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL || "gateway.pinata.cloud",
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Upload JSON metadata to Pinata
    const upload = await pinata.upload.json(body);
    
    return NextResponse.json({ 
      cid: upload.IpfsHash,
      gatewayUrl: `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${upload.IpfsHash}`
    }, { status: 200 });
  } catch (error) {
    console.error("Pinata metadata upload error:", error);
    return NextResponse.json({ error: "Failed to upload metadata to IPFS" }, { status: 500 });
  }
}
