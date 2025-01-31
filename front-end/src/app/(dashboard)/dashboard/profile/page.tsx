"use client";

import { useAccount } from "wagmi";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

import { ConnectWalletPrompt } from "@/components/ConnectWalletPrompt";
import { ProfileSkeleton } from "@/components/ProfileSkeleton";
import { NewUserWelcome } from "@/components/NewUserWelcome";
import { ExistingUserProfile } from "@/components/ExistingUserProfile";

export default function ProfilePage() {
  const { address } = useAccount();
  const { profile, saveProfile, isLoading } = useProfile();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  const handleProfileUpdate = async (formData: FormData) => {
    try {
      setIsUpdating(true);
      
      if (!address) {
        throw new Error("Wallet not connected");
      }

      // Handle avatar upload if present
      let avatarCid = profile?.avatar;
      const avatarFile = formData.get("avatar") as File;
      if (avatarFile && avatarFile.size > 0) {
        // Upload avatar through API route
        const avatarFormData = new FormData();
        avatarFormData.append("file", avatarFile);

        const response = await fetch("/api/upload/avatar", {
          method: "POST",
          body: avatarFormData,
        });

        if (!response.ok) {
          throw new Error("Failed to upload avatar");
        }

        const { cid } = await response.json();
        avatarCid = cid;
      }

      const profileData = {
        username: formData.get("username") as string,
        bio: formData.get("bio") as string,
        avatar: avatarCid,
        discordId: formData.get("discordId") as string,
        telegramHandle: formData.get("telegramHandle") as string,
        notificationPreferences: {
          discord: formData.get("discordNotifications") === "on",
          telegram: formData.get("telegramNotifications") === "on",
          email: false,
        },
      };

      await saveProfile(profileData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (!address) {
    return <ConnectWalletPrompt />;
  }

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return <NewUserWelcome onSetupProfile={handleProfileUpdate} />;
  }

  return (
    <ExistingUserProfile
      profile={profile}
      isUpdating={isUpdating}
      onUpdateProfile={handleProfileUpdate}

    />
  );
}
