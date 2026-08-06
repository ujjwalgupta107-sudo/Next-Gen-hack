import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/app/lib/db";
import { Asset } from "@/app/models/Asset";

export async function GET(req: NextRequest, { params }: { params: { sha256: string } }) {
  try {
    await connectToDatabase();
    
    const asset = await Asset.findOne({ "fingerprints.sha256": params.sha256 });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset, { status: 200 });
  } catch (error) {
    console.error("Fetch asset error:", error);
    return NextResponse.json({ error: "Failed to fetch asset" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { sha256: string } }) {
  try {
    await connectToDatabase();
    const updateData = await req.json();
    
    const asset = await Asset.findOneAndUpdate(
      { "fingerprints.sha256": params.sha256 },
      { $set: updateData },
      { new: true }
    );
    
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    
    return NextResponse.json(asset, { status: 200 });
  } catch (error) {
    console.error("Update asset error:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
