import { NextResponse } from "next/server";
import { createAutoDriveApi, uploadFile } from "@autonomys/auto-drive";
import { TaskMetadata } from "@/types/task";

export async function POST(req: Request) {
  if (!process.env.AUTO_DRIVE_API_KEY) {
    return NextResponse.json(
      { error: "AutoDrive API key is not set" },
      { status: 500 }
    );
  }

  try {
    const metadata: TaskMetadata = await req.json();
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));

    const driveClient = createAutoDriveApi({
      apiKey: process.env.AUTO_DRIVE_API_KEY,
      url:
        process.env.AUTO_DRIVE_URL ||
        "https://demo.auto-drive.autonomys.xyz/api",
    });

    const genericFile = {
      read: async function* () {
        yield metadataBuffer;
      },
      name: "task-metadata.json",
      mimeType: "application/json",
      size: metadataBuffer.length,
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
    console.error("Error uploading metadata:", error);
    return NextResponse.json(
      { error: "Failed to upload metadata" },
      { status: 500 }
    );
  }
}
