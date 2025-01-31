import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";

export interface ProfileData {
  address: `0x${string}`;
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


export function useProfile() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileCid, setProfileCid] = useState<string | null>(null);

  // Load profile from Auto Drive using CID
  useEffect(() => {
    const loadProfile = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        const savedCid = localStorage.getItem(`profile-cid-${address}`);
        console.log("savedCid", savedCid);
        if (savedCid) {
          //todo need to get the format for profile cid
          const response = await fetch(`/api/profile/metadata?cid=${savedCid}`);
          if (!response.ok) {
            throw new Error("Failed to fetch profile");
          }
          const profileData = await response.json();
          console.log("profileData", profileData);
          setProfile(profileData);
          setProfileCid(savedCid);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [address]);

  const updateNotificationPreferences = async (profile: ProfileData) => {
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discordId: profile.discordId,
          telegramHandle: profile.telegramHandle,
          preferences: profile.notificationPreferences,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update notification preferences");
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  };

  const saveProfile = async (profileData: Partial<ProfileData>) => {
    if (!address) return;

    try {
      const updatedProfile: ProfileData = {
        ...profile,
        ...profileData,
        address,
        notificationPreferences: {
          discord: profileData.notificationPreferences?.discord || false,
          telegram: profileData.notificationPreferences?.telegram || false,
          email: false,
        },
        updatedAt: new Date().toISOString(),
      };

      // Upload to Auto Drive through API route
      const response = await fetch("/api/upload/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to upload profile");
      }

      const { cid } = await response.json();
      localStorage.setItem(`profile-cid-${address}`, cid);
      
      setProfile(updatedProfile);
      setProfileCid(cid);

      // Update notification preferences if changed
      if (profileData.discordId || profileData.telegramHandle) {
        await updateNotificationPreferences(updatedProfile);
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully saved",
      });

      return true;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error saving profile",
        description: "Failed to save profile data",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    profile,
    isLoading,
    saveProfile,
    profileCid,
  };
}
