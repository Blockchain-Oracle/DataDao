import { NextRequest, NextResponse } from "next/server";
import { TaskMetadata } from "@/types/task";
import { createAutoDriveApi, downloadFile } from '@autonomys/auto-drive';

const detectFileType = async (arrayBuffer: ArrayBuffer): Promise<string> => {
  const bytes = [...new Uint8Array(arrayBuffer.slice(0, 4))]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const magicNumbers = {
    "89504E47": "image/png",
    FFD8FFE0: "image/jpeg",
    FFD8FFE1: "image/jpeg",
    FFD8FFE2: "image/jpeg",
    FFD8FFE3: "image/jpeg",
    FFD8FFE8: "image/jpeg",
    FFD8FFDB: "image/jpeg",
    FFD8FFEE: "image/jpeg",
    "47494638": "image/gif",
    "3C3F786D": "image/svg+xml",
    "3C737667": "image/svg+xml",
    "424D": "image/bmp",
  };

  for (const [signature, type] of Object.entries(magicNumbers)) {
    if (bytes.startsWith(signature)) {
      return type;
    }
  }

  return "unknown";
};

const apiKey = process.env.AUTO_DRIVE_API_KEY;
if (apiKey == undefined) {
throw new Error("AUTO_DRIVE_API_KEY is not set");
}

async function fetchFromAutoDrive(cid: string) {
  const api = createAutoDriveApi({ apiKey,network:"taurus" });
  console.log(cid, "cid");
  try {
    const stream = await downloadFile(api, cid);
    let file = Buffer.alloc(0);
    for await (const chunk of stream) {
      file = Buffer.concat([file, chunk]);
    }
    return file;
  } catch (error) {
    console.error('Error downloading file:', error);
    throw new Error("CID not found");
  }
}

async function processMetadata(cid: string): Promise<NextResponse> {
  try {
    const fileBuffer = await fetchFromAutoDrive(cid);
    const jsonString = fileBuffer.toString("utf-8");
    console.log(jsonString, "jsonString(((((   ))))))))))");
    const metadata = JSON.parse(jsonString.trim()) as TaskMetadata;

    // Process image URLs in metadata
    if (metadata.images) {
      metadata.images = metadata.images.map((img) => ({
        ...img,
        url: `/api/cid/image/${img.cid}`,
      }));
    }

    return NextResponse.json(metadata);
  } catch (error) {
    console.error("Error processing metadata:", error);
    return NextResponse.json(
      { error: "Invalid metadata format" },
      { status: 400 }
    );
  }
}

async function processImage(cid: string): Promise<NextResponse> {
  try {
    const fileBuffer = await fetchFromAutoDrive(cid) ;
    const fileType = await detectFileType(fileBuffer);

    if (!fileType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid image format" },
        { status: 400 }
      );
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": fileType,
      },
    });
  } catch (error) {
    console.error("Error processing image:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;
    const segments = pathname.split("/").slice(3);
    const type = segments[0]; // 'metadata' or 'image'
    const cid = segments[1];

    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    if (type === "metadata") {
      return await processMetadata(cid);
    } else if (type === "image") {
      return await processImage(cid);
    } else {
      return NextResponse.json(
        { error: "Invalid type - must be 'metadata' or 'image'" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
