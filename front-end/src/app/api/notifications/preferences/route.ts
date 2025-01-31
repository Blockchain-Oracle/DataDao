import { NextResponse } from "next/server";
import { Client as DiscordClient } from "discord.js";
import { Telegraf, session } from "telegraf";
import { createAutoDriveApi, downloadFile, uploadFile } from "@autonomys/auto-drive";

// Initialize Auto Drive client
const driveClient = createAutoDriveApi({
  apiKey: process.env.AUTO_DRIVE_API_KEY!,
  network: "taurus"
});

// Initialize Discord client with proper intents
export const discord = new DiscordClient({
  intents: ['GuildMessages', 'DirectMessages'],
});

discord.on('ready', () => {
  console.log(`Discord bot logged in as ${discord.user?.tag}`);
});

// Define session interface
// Initialize Telegram bot with session
export const telegram = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

// Use session middleware
telegram.use(session());

interface NotificationPreferences {
  address: string;
  telegramHandle?: string;
  telegramChatId?: string;
  discordId?: string;
  preferences: {
    discord: boolean;
    telegram: boolean;
  };
}

// Helper function to store preferences in Auto Drive
async function storePreferences(preferences: NotificationPreferences): Promise<string> {
  const buffer = Buffer.from(JSON.stringify(preferences));
  
  const genericFile = {
    read: async function* () {
      yield buffer;
    },
    name: `notifications-${preferences.address}.json`,
    mimeType: "application/json",
    size: buffer.length,
  };

  const cid = await uploadFile(driveClient, genericFile, {
    compression: true,
  });

  return cid.toString();
}

// Helper function to fetch preferences from Auto Drive
async function fetchPreferences(cid: string): Promise<NotificationPreferences | null> {
  try {
    const stream = await downloadFile(driveClient, cid);
    let file = Buffer.alloc(0);
    
    for await (const chunk of stream) {
      file = Buffer.concat([file, chunk]);
    }
    
    return JSON.parse(file.toString());
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return null;
  }
}

telegram.command('start', async (ctx) => {
  const chatId = ctx.chat.id;
  const username = ctx.from.username;
  
  if (!username) {
    ctx.reply('Please set a Telegram username to use this bot.');
    return;
  }

  // Now we can safely access session
  const prefCid = ctx.session?.preferencesCid;
  
  if (prefCid) {
    const prefs = await fetchPreferences(prefCid);
    if (prefs) {
      // Update preferences with new chat ID
      const updatedPrefs = {
        ...prefs,
        telegramChatId: chatId.toString(),
      };
      
      // Store updated preferences
      const newCid = await storePreferences(updatedPrefs);
      ctx.session.preferencesCid = newCid;
    }
  }
  
  ctx.reply('Welcome to Data DAO! You will now receive notifications for new tasks.');
});

// Start the bots and ensure Discord is logged in before handling requests
let discordReady = false;
export const initializeNotificationClients = async () => {
  await discord.login(process.env.DISCORD_BOT_TOKEN);
  discordReady = true;
  telegram.launch();
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { address, discordId, telegramHandle, preferences, currentCid } = body;

    // Fetch existing preferences if currentCid exists
    const existingPrefs = currentCid ? await fetchPreferences(currentCid) : null;

    const updatedPrefs: NotificationPreferences = {
      ...existingPrefs,
      address,
      discordId,
      telegramHandle,
      preferences: {
        discord: preferences.discord || false,
        telegram: preferences.telegram || false,
      }
    };

    // Handle Discord notifications
    if (discordId && preferences.discord) {
      if (!discordReady) {
        return NextResponse.json(
          { error: "Discord bot not ready. Please try again in a moment." },
          { status: 503 }
        );
      }
      try {
        const user = await discord.users.fetch(discordId);
        await user.send("You have successfully enabled Discord notifications!");
        updatedPrefs.discordId = discordId;
      } catch (err) {
        console.error("Discord notification error:", err);
        return NextResponse.json(
          {
            error: "Failed to connect Discord. Please message the bot first.",
          },
          { status: 400 }
        );
      }
    }

    // Handle Telegram notifications  
    if (telegramHandle && preferences.telegram) {
      try {
        const handle = telegramHandle.replace("@", "");
        await telegram.telegram.sendMessage(
          handle,
          "You have successfully enabled Telegram notifications!"
        );
        updatedPrefs.telegramHandle = handle;
      } catch (err) {
        console.error("Telegram notification error:", err);
        return NextResponse.json(
          {
            error: "Failed to connect Telegram. Start the bot with /start first.",
          },
          { status: 400 }
        );
      }
    }

    // Store updated preferences
    const newCid = await storePreferences(updatedPrefs);

    return NextResponse.json({
      success: true, 
      cid: newCid
    });
  } catch (error) {
    console.error("Notification preference error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
