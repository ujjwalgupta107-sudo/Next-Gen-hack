import { NextRequest, NextResponse } from "next/server";
import { generateAuthNonce } from "@/app/lib/auth";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const address = url.searchParams.get("address") || undefined;
  
  const nonce = generateAuthNonce(address);
  return NextResponse.json({
    nonce,
    issuedAt: new Date().toISOString(),
  }, { status: 200 });
}
