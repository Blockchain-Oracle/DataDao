"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useState, useCallback } from "react";
import { useDataLabelPlatform } from "@/hooks/useDataLabelPlatform";
import { useTaskUpload } from "@/hooks/useTaskUpload";
import { ImageUpload } from "@/components/ui/image-upload";
import { parseEther } from "viem";
import { toast } from "@/hooks/use-toast";
import { useAccount } from "wagmi";
import { Progress } from "@/components/ui/progress";
import { TaskMetadata } from "@/types/task";
import { wagmiContractConfig } from "@/lib/constant";
import { useWatchContractEvent } from "wagmi";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  reward: z.string().min(1, "Reward amount is required"),
  deadline: z
    .string()
    .min(1, "Deadline is required")
    .refine((date) => {
      const now = new Date();
      const selectedDate = new Date(date);
      const minDate = new Date(now.getTime() + 3 * 60 * 60 * 1000); // 3 hours from now
      return selectedDate > minDate;
    }, "Deadline must be at least 3 hours from now"),
  options: z.array(z.string()).optional(),
});

export function CreateTaskModal() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"upload" | "transaction" | "complete">(
    "upload"
  );
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      reward: "",
      deadline: "",
      options: [],
    },
  });

  const { createTask } = useDataLabelPlatform();
  const {
    isUploading,
    uploadImages,
    createTaskMetadata,
    uploadProgress,
    resetProgress,
  } = useTaskUpload();
  const { address } = useAccount();

  // Watch task creation events
  useWatchContractEvent({
    ...wagmiContractConfig,
    eventName: "TaskCreated",
    onLogs() {
      setStep("complete");
      toast({
        title: "Task created successfully",
        description: "Your task has been created and is now live",
      });
      setOpen(false);
      form.reset();
      setFiles([]);
      resetProgress();
      setIsSubmitting(false);
      router.refresh();
    },
  });

  const handleCreate = async (values: z.infer<typeof formSchema>) => {
    if (!address) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to create a task",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      setStep("upload");

      if (files.length === 0) {
        toast({
          title: "Images required",
          description: "Please upload at least one image",
          variant: "destructive",
        });
        return;
      }

      const imageHashes = await uploadImages(files);

      const metadata: TaskMetadata = {
        title: values.title,
        description: values.description,
        images: imageHashes.map((cid) => ({ cid })),
        options: values.options || [],
        creator: address,
        totalReward: parseEther(values.reward),
        deadline: new Date(values.deadline).getTime() / 1000,
        tokenAddress: wagmiContractConfig.address,
        createdAt: Date.now(),
      };

      const metadataHash = await createTaskMetadata(metadata);

      setStep("transaction");

      await createTask(
        metadataHash,
        parseEther(values.reward),
        BigInt(metadata.deadline)
      );

      toast({
        title: "Task creation initiated",
        description: "Creating your task...",
      });
    } catch (error) {
      console.error("Task creation error:", error);
      toast({
        title: "Error creating task",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const renderProgress = useCallback(() => {
    if (step === "upload") {
      return (
        <div className="space-y-2">
          <Progress value={uploadProgress.images} className="h-2" />
          <p className="text-sm text-muted-foreground">
            Uploading images: {Math.round(uploadProgress.images)}%
          </p>
          {uploadProgress.metadata > 0 && (
            <>
              <Progress value={uploadProgress.metadata} className="h-2" />
              <p className="text-sm text-muted-foreground">
                Creating metadata: {Math.round(uploadProgress.metadata)}%
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  }, [step, uploadProgress]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create Task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[900px] p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Create New Task
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Create a new data labeling task with rewards for participants
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreate)}
            className="space-y-4 sm:space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task title..."
                          {...field}
                          className="text-sm sm:text-base p-2 sm:p-3"
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reward"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Total Reward (DDAO)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="100"
                          className="text-sm sm:text-base p-2 sm:p-3"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Total reward amount in DDAO tokens
                      </FormDescription>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Deadline
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          className="text-sm sm:text-base p-2 sm:p-3"
                        />
                      </FormControl>
                      <FormDescription className="text-xs sm:text-sm">
                        Task deadline (minimum 3 hours from now)
                      </FormDescription>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm sm:text-base">
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter detailed task description..."
                          className="min-h-[120px] text-sm sm:text-base p-2 sm:p-3"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs sm:text-sm" />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <FormLabel className="text-sm sm:text-base">
                    Task Images
                  </FormLabel>
                  <ImageUpload
                    value={files}
                    onChange={setFiles}
                    maxFiles={5}
                    maxSize={10 * 1024 * 1024}
                  />
                  <FormDescription className="text-xs sm:text-sm">
                    Upload up to 5 images (max 10MB each)
                  </FormDescription>
                </div>
              </div>
            </div>

            {(isUploading || isSubmitting) && renderProgress()}

            <div className="flex justify-end gap-3 pt-4 sm:pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setOpen(false);
                  form.reset();
                  setFiles([]);
                  resetProgress();
                }}
                className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUploading || isSubmitting}
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2"
              >
                {isUploading || isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {step === "upload" ? "Uploading..." : "Creating..."}
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
