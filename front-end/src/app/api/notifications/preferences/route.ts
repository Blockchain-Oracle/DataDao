import { NextResponse } from "next/server";
import { Client as DiscordClient } from "discord.js";
import { Telegraf } from "telegraf";

// Initialize Discord client
const discord = new DiscordClient({ intents: [] });
discord.login(process.env.DISCORD_BOT_TOKEN);

// Initialize Telegram bot
const telegram = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Store preferences in database
    const { discordId, telegramHandle, preferences } = body;

    // Handle Discord notifications
    if (discordId && preferences.discord) {
      try {
        const user = await discord.users.fetch(discordId);
        // Send test message to verify connection
        await user.send("You have successfully enabled Discord notifications!");
      } catch (err) {
        console.error("Discord notification error:", err);
        return NextResponse.json(
          {
            error:
              "Failed to connect Discord. Please make sure you've messaged the bot first.",
          },
          { status: 400 }
        );
      }
    }

    // Handle Telegram notifications
    if (telegramHandle && preferences.telegram) {
      try {
        // Remove @ if present in handle
        const handle = telegramHandle.replace("@", "");
        // Send test message to verify connection
        await telegram.telegram.sendMessage(
          handle,
          "You have successfully enabled Telegram notifications!"
        );
      } catch (err) {
        console.error("Telegram notification error:", err);
        return NextResponse.json(
          {
            error:
              "Failed to connect Telegram. Please make sure you've started the bot with /start",
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification preference error:", error);
    return NextResponse.json(
      { error: "Failed to update notification preferences" },
      { status: 500 }
    );
  }
}
