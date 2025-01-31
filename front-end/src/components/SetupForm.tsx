import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

interface SetupFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
}

export function SetupForm({ onSubmit }: SetupFormProps) {
  return (
    <form action={onSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="username">Username *</Label>
          <Input
            id="username"
            name="username"
            placeholder="Choose a username"
            required
            className="mt-1.5"
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
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Receive notifications via Discord
                </p>
                <Switch name="discordNotifications" />
              </div>
            </div>

            <div>
              <Label htmlFor="telegramHandle">Telegram Handle</Label>
              <Input
                id="telegramHandle"
                name="telegramHandle"
                placeholder="@yourusername"
                className="mt-1.5"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  Receive notifications via Telegram
                </p>
                <Switch name="telegramNotifications" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row-reverse">
        <Button type="submit" className="flex-1 sm:flex-none">
          Complete Setup
        </Button>
        <Button type="button" variant="outline" className="flex-1 sm:flex-none">
          Skip for Now
        </Button>
      </div>
    </form>
  );
}
