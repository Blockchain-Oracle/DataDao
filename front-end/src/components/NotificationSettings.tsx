import { ProfileData } from "@/hooks/useProfile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface NotificationSettingsProps {
  profile: ProfileData;
  isUpdating: boolean;
  onUpdateProfile: (formData: FormData) => Promise<void>;
}

export function NotificationSettings({
  profile,
  isUpdating,
  onUpdateProfile,
}: NotificationSettingsProps) {
  const handlePreferenceChange = async (type: 'discord' | 'telegram', checked: boolean) => {
    const formData = new FormData();
    formData.set(`${type}Notifications`, checked ? "on" : "off");
    
    // If enabling notifications, ensure ID/handle exists
    if (checked) {
      const idField = type === 'discord' ? profile.discordId : profile.telegramHandle;
      if (!idField) {
        formData.set(type === 'discord' ? 'discordId' : 'telegramHandle', '');
      }
    }
    
    await onUpdateProfile(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how you want to receive updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Discord Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via Discord
            </p>
          </div>
          <Switch
            name="discordNotifications"
            disabled={isUpdating}
            defaultChecked={profile.notificationPreferences?.discord}
            onCheckedChange={(checked) => handlePreferenceChange('discord', checked)}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Telegram Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive updates via Telegram
            </p>
          </div>
          <Switch
            name="telegramNotifications"
            disabled={isUpdating}
            defaultChecked={profile.notificationPreferences?.telegram}
            onCheckedChange={(checked) => handlePreferenceChange('telegram', checked)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
