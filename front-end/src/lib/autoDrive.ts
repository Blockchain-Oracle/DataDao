import { createAutoDriveApi, uploadFile } from "@autonomys/auto-drive";

// Initialize Auto Drive client
const driveClient = createAutoDriveApi({
  apiKey: process.env.AUTO_DRIVE_API_KEY,
  url:
    process.env.AUTO_DRIVE_URL || "https://demo.auto-drive.autonomys.xyz/api",
});

export interface ProfileData {
  address: string;
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

export async function uploadProfile(profile: ProfileData): Promise<string> {
  try {
    // Convert profile to JSON and prepare for upload
    const profileData = JSON.stringify(profile);
    const buffer = Buffer.from(profileData);

    const genericFile = {
      read: async function* () {
        yield buffer;
      },
      name: `profile-${profile.address}.json`,
      mimeType: "application/json",
      size: buffer.length,
    };

    const options = {
      compression: true,
      onProgress: (progress: number) => {
        console.log(`Upload is ${progress}% completed`);
      },
    };

    const cid = await uploadFile(driveClient, genericFile, options);
    return cid.toString();
  } catch (error) {
    console.error("Error uploading to Auto Drive:", error);
    throw error;
  }
}

export async function fetchProfile(cid: string): Promise<ProfileData | null> {
  try {
    const response = await fetch(`/api/cid/metadata/${cid}`);
    if (!response.ok) {
      throw new Error("Failed to fetch profile");
    }
    const data = await response.json();
    return data as ProfileData;
  } catch (error) {
    console.error("Error fetching from Auto Drive:", error);
    return null;
  }
}
