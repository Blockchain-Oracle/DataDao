import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";

interface SetupFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

export function SetupForm({ onSubmit }: SetupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscordAlert, setShowDiscordAlert] = useState(false);
  const [showTelegramAlert, setShowTelegramAlert] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const formData = new FormData(e.currentTarget);
      await onSubmit(formData);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    router.push("/dashboard");
  };

  const DISCORD_BOT_LINK = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || "https://discord.com/oauth2/authorize?client_id=1334564358000214037";
  const TELEGRAM_BOT_LINK = "https://t.me/YourBotUsername"; // Replace with your Telegram bot link

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            name="username"
            placeholder="Choose a username"
            required
            className="mt-1.5"
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be your display name on the platform
          </p>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            placeholder="Tell us a bit about yourself"
            className="mt-1.5 h-24"
            disabled={isLoading}
          />
        </div>

        <Separator className="my-6" />
        
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Settings</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="discordId">Discord ID</Label>
              <Input
                id="discordId"
                name="discordId"
                placeholder="username#1234"
                className="mt-1.5"
                disabled={isLoading}
                onChange={() => setShowDiscordAlert(true)}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Receive notifications via Discord
                </p>
                <Switch 
                  name="discordNotifications" 
                  disabled={isLoading}
                  onCheckedChange={(checked) => setShowDiscordAlert(checked)}
                />
              </div>
              {showDiscordAlert && (
                <Alert className="mt-2">
                  <AlertDescription className="flex items-center justify-between">
                    <span>Connect with our Discord bot first</span>
                    <Link 
                      href={DISCORD_BOT_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      Connect <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            <div>
              <Label htmlFor="telegramHandle">Telegram Handle</Label>
              <Input
                id="telegramHandle"
                name="telegramHandle"
                placeholder="@yourusername"
                className="mt-1.5"
                disabled={isLoading}
                onChange={() => setShowTelegramAlert(true)}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Receive notifications via Telegram
                </p>
                <Switch 
                  name="telegramNotifications" 
                  disabled={isLoading}
                  onCheckedChange={(checked) => setShowTelegramAlert(checked)}
                />
              </div>
              {showTelegramAlert && (
                <Alert className="mt-2">
                  <AlertDescription className="flex items-center justify-between">
                    <span>Start a chat with our Telegram bot first</span>
                    <Link 
                      href={TELEGRAM_BOT_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-primary hover:underline"
                    >
                      Connect <ExternalLink className="ml-1 h-4 w-4" />
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row-reverse">
        <Button 
          type="submit" 
          className="flex-1 sm:flex-none"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Setting up...
            </>
          ) : (
            "Complete Setup"
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 sm:flex-none"
          onClick={handleSkip}
          disabled={isLoading}
        >
          Skip for Now
        </Button>
      </div>
    </form>
  );
}
