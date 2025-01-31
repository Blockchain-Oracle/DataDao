import { useState } from "react";
import { ProfileData } from "@/hooks/useProfile";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface PersonalInformationProps {
  profile: ProfileData;
  isUpdating: boolean;
  onUpdateProfile: (formData: FormData) => Promise<void>;
}

export function PersonalInformation({
  profile,
  isUpdating,
  onUpdateProfile,
}: PersonalInformationProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Truncate wallet address for display
  const truncatedAddress = `${profile.address.slice(0, 6)}...${profile.address.slice(-4)}`;
  
  // Use address as fallback when username is null
  const displayName = profile.username || truncatedAddress;

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create form data with the new avatar
      const formData = new FormData();
      formData.append("avatar", file);
      
      // Trigger profile update
      await onUpdateProfile(formData);
    }
  };

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

  const EditProfileForm = () => (
    <form className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-6" onSubmit={async (e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      await onUpdateProfile(formData);
      setIsEditModalOpen(false);
    }}>
      {/* Left Column */}
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage 
              src={profile.avatar ? `/api/cid/image/${profile.avatar}` : undefined} 
              alt={displayName} 
            />
            <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <Input
              type="file"
              accept="image/*"
              className="hidden"
              id="avatar-upload"
              name="avatar"
              onChange={handleAvatarChange}
            />
            <Button
              variant="outline"
              type="button"
              onClick={() => document.getElementById("avatar-upload")?.click()}
            >
              Change Avatar
            </Button>
          </div>
        </div>

        <Separator className="md:hidden" />

        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Username *</Label>
            <Input
              id="username"
              name="username"
              defaultValue={profile.username || ''}
              placeholder="Choose a username"
              required
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Currently using wallet address: {truncatedAddress}
            </p>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={profile.bio || ''}
              placeholder="Tell us about yourself"
              className="mt-1.5 h-24"
            />
          </div>
        </div>
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="discordId">Discord ID</Label>
          <Input
            id="discordId"
            name="discordId"
            defaultValue={profile.discordId}
            placeholder="username#1234"
            className="mt-1.5"
          />
          <div className="flex items-center justify-between mt-2">
            <Label>Enable Discord Notifications</Label>
            <Switch
              name="discordNotifications"
              defaultChecked={profile.notificationPreferences?.discord}
              onCheckedChange={(checked) => handlePreferenceChange('discord', checked)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="telegramHandle">Telegram Handle</Label>
          <Input
            id="telegramHandle"
            name="telegramHandle"
            defaultValue={profile.telegramHandle}
            placeholder="@yourusername"
            className="mt-1.5"
          />
          <div className="flex items-center justify-between mt-2">
            <Label>Enable Telegram Notifications</Label>
            <Switch
              name="telegramNotifications" 
              defaultChecked={profile.notificationPreferences?.telegram}
              onCheckedChange={(checked) => handlePreferenceChange('telegram', checked)}
            />
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={isUpdating}
          className="w-full mt-6"
        >
          {isUpdating ? "Saving Changes..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            {profile.username ? 'Your profile information' : 'Complete your profile'}
          </CardDescription>
        </div>
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="icon">
              <Edit2 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {profile.username ? 'Edit Profile' : 'Complete Your Profile'}
              </DialogTitle>
              <DialogDescription>
                {profile.username 
                  ? 'Make changes to your profile information here'
                  : 'Set up your profile to get started'
                }
              </DialogDescription>
            </DialogHeader>
            <EditProfileForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={profile.avatar ? `/api/cid/image/${profile.avatar}` : undefined} 
                alt={displayName} 
              />
              <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{displayName}</h3>
              {!profile.username && (
                <p className="text-sm text-muted-foreground">
                  Click edit to set up your username
                </p>
              )}
              {profile.bio ? (
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No bio added yet
                </p>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            {!profile.discordId && !profile.telegramHandle && (
              <p className="text-sm text-muted-foreground italic">
                No notification preferences set. Click edit to add Discord or Telegram.
              </p>
            )}
            
            {profile.discordId && (
              <div>
                <Label className="text-sm text-muted-foreground">Discord</Label>
                <p className="mt-1">{profile.discordId}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Notifications</span>
                  <Switch
                    checked={profile.notificationPreferences?.discord}
                    onCheckedChange={(checked) => handlePreferenceChange('discord', checked)}
                  />
                </div>
              </div>
            )}

            {profile.telegramHandle && (
              <div>
                <Label className="text-sm text-muted-foreground">Telegram</Label>
                <p className="mt-1">{profile.telegramHandle}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-muted-foreground">Notifications</span>
                  <Switch
                    checked={profile.notificationPreferences?.telegram}
                    onCheckedChange={(checked) => handlePreferenceChange('telegram', checked)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}