import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { uploadProfile, fetchProfile, ProfileData } from "@/lib/autoDrive";
import { useToast } from "@/hooks/use-toast";

export function useProfile() {
  const { address } = useAccount();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile from Auto Drive
  useEffect(() => {
    const loadProfile = async () => {
      if (!address) return;

      try {
        setIsLoading(true);
        // Get CID from local storage
        const profileCid = localStorage.getItem(`profile-${address}`);

        if (profileCid) {
          const profileData = await fetchProfile(profileCid);
          if (profileData) {
            setProfile(profileData);
          }
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

  // const updateNotificationPreferences = async (profile: ProfileData) => {
  //   try {
  //     const response = await fetch("/api/notifications/preferences", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         discordId: profile.discordId,
  //         telegramHandle: profile.telegramHandle,
  //         preferences: profile.notificationPreferences,
  //       }),
  //     });

  //     if (!response.ok) {
  //       const data = await response.json();
  //       throw new Error(
  //         data.error || "Failed to update notification preferences"
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Error updating notification preferences:", error);
  //     throw error;
  //   }
  // };

  // Save profile to Auto Drive
  // const saveProfile = async (profileData: Partial<ProfileData>) => {
  //   if (!address) return;

  //   try {
  //     const updatedProfile: ProfileData = {
  //       ...profile,
  //       ...profileData,
  //       address,
  //       notificationPreferences: {
  //         discord: profileData.notificationPreferences?.discord || false,
  //         telegram: profileData.notificationPreferences?.telegram || false,
  //         email: profileData.notificationPreferences?.email || false,
  //       },
  //       updatedAt: new Date().toISOString(),
  //     };

  //     // Upload to Auto Drive
  //     const cid = await uploadProfile(updatedProfile);

  //     // Store CID in local storage
  //     localStorage.setItem(`profile-${address}`, cid);

  //     setProfile(updatedProfile);

  //     // Update notification service if needed
  //     if (profileData.discordId || profileData.telegramHandle) {
  //       await updateNotificationPreferences(updatedProfile);
  //     }

  //     toast({
  //       title: "Profile updated",
  //       description: "Your profile has been successfully saved",
  //     });

  //     return cid;
  //   } catch (error) {
  //     console.error("Error saving profile:", error);
  //     toast({
  //       title: "Error saving profile",
  //       description: "Failed to save profile data",
  //       variant: "destructive",
  //     });
  //     throw error;
  //   }
  // };

  return {
    profile,
    isLoading,
    // saveProfile,
  };
}
