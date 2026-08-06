import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";

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
    
    const newAsset = new Asset(data);
    await newAsset.save();
    
    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    console.error("Create asset error:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}
