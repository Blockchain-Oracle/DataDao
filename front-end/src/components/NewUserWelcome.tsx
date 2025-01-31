import { User } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";


import { QuickStartGuide } from "./QuickStartGuide";
import { SetupForm } from "./SetupForm";

interface NewUserWelcomeProps {
  onSetupProfile: (formData: FormData) => Promise<void>;
}

export function NewUserWelcome({ onSetupProfile }: NewUserWelcomeProps) {
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Welcome to Data DAO!</CardTitle>
          <CardDescription className="mt-2">
            Let&apos;s set up your profile to get started with the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupForm onSubmit={onSetupProfile} />
        </CardContent>
      </Card>

      <QuickStartGuide />
    </div>
  );
}
