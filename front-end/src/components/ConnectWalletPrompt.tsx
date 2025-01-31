import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export function ConnectWalletPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <CardTitle>Connect Wallet</CardTitle>
          <CardDescription>
            Please connect your wallet to access your profile
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
