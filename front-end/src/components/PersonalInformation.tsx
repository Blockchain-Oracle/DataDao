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

interface PersonalInformationProps {
  profile: ProfileData;
  isUpdating: boolean;
  onUpdateProfile: (formData: FormData) => Promise<void>;
  avatarUrl: string | null;
}

export function PersonalInformation({
  profile,
  isUpdating,
  onUpdateProfile,
  avatarUrl,
}: PersonalInformationProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your profile information</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" action={onUpdateProfile}>
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={avatarUrl || profile.avatar} alt={profile.username} />
              <AvatarFallback>
                {profile.username?.slice(0, 2)?.toUpperCase() || "UN"}
              </AvatarFallback>
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

          <Separator />

          <div className="space-y-4">
            <div>
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                name="username"
                defaultValue={profile.username}
                placeholder="Enter username"
                required
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={profile.bio}
                placeholder="Tell us about yourself"
                className="mt-1.5 h-24"
              />
            </div>

            <div>
              <Label htmlFor="discordId">Discord ID</Label>
              <Input
                id="discordId"
                name="discordId"
                defaultValue={profile.discordId}
                placeholder="username#1234"
                className="mt-1.5"
              />
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
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isUpdating}
            className="w-full"
          >
            {isUpdating ? "Saving Changes..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
