import { NextResponse } from "next/server";
import { createAutoDriveApi, uploadFile } from "@autonomys/auto-drive";

export interface ProfileData {
  address: `0x${string}`;
  username?: string;
  bio?: string;
  avatar?: string;
  discordId?: string;
  telegramHandle?: string;
  notificationPreferences: {
    discord: boolean;
    telegram: boolean;
    email: boolean;
  };
  updatedAt: string;
}

export async function POST(req: Request) {
  if (!process.env.AUTO_DRIVE_API_KEY) {
    return NextResponse.json(
      { error: "AutoDrive API key is not set" },
      { status: 500 }
    );
  }

  try {
    const profileData: ProfileData = await req.json();
    const profileBuffer = Buffer.from(JSON.stringify(profileData));

    const driveClient = createAutoDriveApi({
      apiKey: process.env.AUTO_DRIVE_API_KEY,
      url: process.env.AUTO_DRIVE_URL || "https://demo.auto-drive.autonomys.xyz/api",
    });

    const genericFile = {
      read: async function* () {
        yield profileBuffer;
      },
      name: "profile-data.json",
      mimeType: "application/json",
      size: profileBuffer.length,
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
      url: `${process.env.NEXT_PUBLIC_HOST}/api/cid/metadata/${cid}`,
    });
  } catch (error) {
    console.error("Error uploading profile:", error);
    return NextResponse.json(
      { error: "Failed to upload profile" },
      { status: 500 }
    );
  }
}
