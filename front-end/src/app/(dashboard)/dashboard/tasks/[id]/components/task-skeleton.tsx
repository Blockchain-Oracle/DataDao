import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TaskDetailsSkeleton() {
  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-9 w-[250px] mb-2" />
          <Skeleton className="h-5 w-[180px]" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-[140px]" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-5 w-[120px]" />
                  <Skeleton className="h-5 w-[80px]" />
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-6 w-[140px]" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-[100px]" />
                  <Skeleton className="h-6 w-[80px]" />
                </div>
              </div>
              <Skeleton className="h-[1px] w-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-[120px]" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-[120px]" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-[100px] mb-2" />
              <Skeleton className="h-5 w-[180px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-[120px]" />
                        <Skeleton className="h-4 w-[80px]" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
