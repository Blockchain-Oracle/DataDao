import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Coins, User, Copy } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CountdownTimer } from "@/components/countdown-timer";
import { useState } from "react";

interface TaskCardProps {
  variant?: "grid" | "list";
  id: number;
  title: string;
  description: string;
  creator: string;
  totalReward: number;
  deadline: number;
  participantCount: number;
  hasParticipated?: boolean;
  images?: { cid: string; url: string; label: string }[];
  options: string[];
  tokenAddress: string;
  createdAt?: number;
}

export function TaskCard({
  variant = "grid",
  id,
  title,
  description,
  creator,
  totalReward,
  deadline,
  participantCount,
  hasParticipated,
  images,
}: TaskCardProps) {
  const [copied, setCopied] = useState(false);
  const deadlineDate = new Date(deadline * 1000);
  const isExpired = deadlineDate.getTime() < Date.now();

  const handleCopyCid = (cid: string) => {
    navigator.clipboard.writeText(cid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={cn(
        "transition-all hover:shadow-md overflow-hidden",
        variant === "list" && "flex flex-row items-center"
      )}
    >
      {images && images.length > 0 && (
        <div
          className={cn(
            "relative",
            variant === "grid" ? "h-48" : "h-full w-48 min-w-[12rem]"
          )}
        >
          {images.map((image, index) => (
            <Image
              key={index}
              src={image.url}
              alt={image.label || `Task ${id} image ${index + 1}`}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                index === 0 ? "opacity-100" : "opacity-0 hover:opacity-100"
              )}
              priority={index === 0}
            />
          ))}
        </div>
      )}
      <div className="flex-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex gap-2 items-center flex-wrap">
            <h3 className="font-semibold text-lg">{title || `Task #${id}`}</h3>
            {isExpired && <Badge variant="destructive">Expired</Badge>}
            {hasParticipated && <Badge variant="secondary">Participated</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span title={creator}>
                  {creator.slice(0, 6)}...{creator.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <CountdownTimer deadline={deadline} className="font-mono" />
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{participantCount} participants</span>
              </div>
              <div className="flex items-center gap-1">
                <Coins className="h-4 w-4" />
                <span>{totalReward} tokens</span>
              </div>
            </div>
            {images && images.length > 0 && (
              <div className="flex items-center gap-2 text-sm font-mono bg-muted p-2 rounded">
                <span className="truncate flex-1">CID: {images[0].cid}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => handleCopyCid(images[0].cid)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                {copied && (
                  <span className="text-xs text-green-500">Copied!</span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href={`/dashboard/tasks/${id}`} className="w-full">
            <Button className="w-full" variant="outline">
              View Details
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
