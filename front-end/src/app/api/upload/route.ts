import { NextResponse } from "next/server";
import { createAutoDriveApi, uploadFile } from "@autonomys/auto-drive";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: Request) {
  if (!process.env.AUTO_DRIVE_API_KEY) {
    return NextResponse.json(
      { error: "AutoDrive API key is not set" },
      { status: 500 }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed" },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File size must be under 5 MB" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const driveClient = createAutoDriveApi({
      apiKey: process.env.AUTO_DRIVE_API_KEY,
      url:
        process.env.AUTO_DRIVE_URL ||
        "https://demo.auto-drive.autonomys.xyz/api",
    });

    const genericFile = {
      read: async function* () {
        yield buffer;
      },
      name: file.name,
      mimeType: file.type,
      size: buffer.length,
    };

    const options = {
      compression: true,
      onProgress: (progress: number) => {
        console.log(`Upload is ${progress}% completed`);
      },
    };

    const cid = await uploadFile(driveClient, genericFile, options);

    return NextResponse.json({
      cid: cid.toString(),
      url: `${process.env.NEXT_PUBLIC_HOST}/api/cid/${process.env.NEXT_PUBLIC_NETWORK}/${cid}`,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
