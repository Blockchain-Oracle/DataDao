import { createAutoDriveApi, uploadFile, downloadFile } from "@autonomys/auto-drive";


const apikey=process.env.AUTO_DRIVE_API_KEY
if(apikey==undefined){
  throw new Error("Autodrice api key not set");
}
// Initialize Auto Drive client
const driveClient = createAutoDriveApi({
  apiKey: apikey,
    network:"taurus"
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
    const stream = await downloadFile(driveClient, cid);
    let file = Buffer.alloc(0);
    
    for await (const chunk of stream) {
      file = Buffer.concat([file, chunk]);
    }
    
    const profileData = JSON.parse(file.toString()) as ProfileData;
    return profileData;
  } catch (error) {
    console.error("Error downloading from Auto Drive:", error);
    return null;
  }
}
