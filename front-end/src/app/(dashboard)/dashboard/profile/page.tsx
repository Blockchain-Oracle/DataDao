"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { useProfile } from "@/hooks/useProfile";
import { useAccount } from "wagmi";
// import { useEventLogs } from "@/hooks/useEventLogs";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { address } = useAccount();
  // const { profile, saveProfile, isLoading } = useProfile();
  // const { logs } = useEventLogs(address!);
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileUpdate = async (formData: FormData) => {
    try {
      setIsUpdating(true);

      // const profileData = {
      //   username: formData.get("username") as string,
      //   bio: formData.get("bio") as string,
      //   discordId: formData.get("discordId") as string,
      //   telegramHandle: formData.get("telegramHandle") as string,
      //   notificationPreferences: {
      //     discord: formData.get("discordNotifications") === "on",
      //     telegram: formData.get("telegramNotifications") === "on",
      //     email: formData.get("emailNotifications") === "on",
      //   },
      // };

      // await saveProfile(profileData);

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated",
      });
    } catch (error) {
      toast({
        title: "Error updating profile",
        description:
          "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              {/* <Avatar className="h-20 w-20">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback>
                  {profile?.username?.slice(0, 2) || "UN"}
                </AvatarFallback>
              </Avatar> */}
              <Button variant="outline">Change Avatar</Button>
            </div>
            <Separator />
            <form className="space-y-4" action={handleProfileUpdate}>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  defaultValue={"hh"}
                  placeholder="Enter username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  name="bio"
                  defaultValue={"dd"}
                  placeholder="Tell us about yourself"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discordId">Discord ID</Label>
                <Input
                  id="discordId"
                  name="discordId"
                  defaultValue={"dd"}
                  placeholder="Enter your Discord ID"
                />
                <p className="text-xs text-muted-foreground">
                  Format: username#1234
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="telegramHandle">Telegram Handle</Label>
                <Input
                  id="telegramHandle"
                  name="telegramHandle"
                  defaultValue={""}
                  placeholder="@yourusername"
                />
              </div>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Choose how you want to receive updates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Discord Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via Discord
                </p>
              </div>
              <Switch name="discordNotifications" checked={true} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Telegram Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates via Telegram
                </p>
              </div>
              <Switch name="telegramNotifications" checked={false} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
