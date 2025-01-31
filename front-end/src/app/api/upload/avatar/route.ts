import { NextResponse } from "next/server";
import { createAutoDriveApi, uploadFile } from "@autonomys/auto-drive";

const apiKey = process.env.AUTO_DRIVE_API_KEY;
if (!apiKey) {
  throw new Error("AUTO_DRIVE_API_KEY is not set");
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Initialize Auto Drive client
    const driveClient = createAutoDriveApi({
      apiKey,
      network: "taurus"
    });

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create generic file for Auto Drive
    const genericFile = {
      read: async function* () {
        yield buffer;
      },
      name: file.name,
      mimeType: file.type,
      size: file.size,
    };

    // Upload to Auto Drive with compression
    const cid = await uploadFile(driveClient, genericFile, {
      compression: true
    });

    return NextResponse.json({
      cid: cid.toString(),
      url: `/api/cid/image/${cid}`,
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
