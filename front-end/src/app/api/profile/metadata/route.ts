import { NextResponse } from "next/server";
import { createAutoDriveApi, downloadFile } from "@autonomys/auto-drive";
import { ProfileData } from "../../upload/profile/route";

const apiKey = process.env.AUTO_DRIVE_API_KEY;
if (!apiKey) {
  throw new Error("AUTO_DRIVE_API_KEY is not set");
}

async function fetchFromAutoDrive(cid: string) {
  const api = createAutoDriveApi({ apiKey, network: "taurus" });
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

export async function GET(req: Request): Promise<NextResponse<ProfileData | { error: string }>> {
  try {
    const url = new URL(req.url);
    const cid = url.searchParams.get("cid");
    console.log("cid", cid);
    if (!cid) {
      return NextResponse.json({ error: "CID is required" }, { status: 400 });
    }

    const fileBuffer = await fetchFromAutoDrive(cid);
    const jsonString = fileBuffer.toString("utf-8");
    const profileData = JSON.parse(jsonString.trim()) as ProfileData;
    console.log("profileData", profileData);
    return NextResponse.json(profileData);
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
