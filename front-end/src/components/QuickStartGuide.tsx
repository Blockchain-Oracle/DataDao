import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ClipboardList, Award } from "lucide-react";

export function QuickStartGuide() {
  return (
    <div className="mt-8 max-w-2xl mx-auto">
      <h2 className="text-lg font-semibold mb-4">Quick Start Guide</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base">Participate in Tasks</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Browse and participate in data labeling tasks to earn rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <CardTitle className="text-base">Earn Rewards</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete tasks accurately to earn tokens and build your reputation
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
