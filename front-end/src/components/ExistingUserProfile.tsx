import { ProfileData } from "@/hooks/useProfile";
    
import { useEventLogs } from "@/hooks/useEventLogs";
import { NotificationSettings } from "./NotificationSettings";
import { ActivityLog } from "./ActivityLog";
import { PersonalInformation } from "./PersonalInformation";

interface ExistingUserProfileProps {
  profile: ProfileData;
  isUpdating: boolean;
  onUpdateProfile: (formData: FormData) => Promise<void>;
}

export function ExistingUserProfile({
  profile,
  isUpdating,
  onUpdateProfile,
}: ExistingUserProfileProps) {
  const { logs, isLoading: isLoadingLogs } = useEventLogs(profile.address);

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and notification preferences
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left column - Personal Information */}
        <PersonalInformation
          profile={profile}
          isUpdating={isUpdating}
          onUpdateProfile={onUpdateProfile}
        />

        {/* Right column - Notifications and Activity */}
        <div className="space-y-6">
          <NotificationSettings
            profile={profile}
            isUpdating={isUpdating}
            onUpdateProfile={onUpdateProfile}
          />
          <ActivityLog logs={logs} isLoading={isLoadingLogs} />
        </div>
      </div>
    </div>
  );
}

