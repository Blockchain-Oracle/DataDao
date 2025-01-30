import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { TaskMetadata } from "@/types/task";
import { Address } from "viem";
import { wagmiContractConfig } from "@/lib/constant";

interface UploadProgress {
  images: number;
  metadata: number;
}

export function useTaskUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    images: 0,
    metadata: 0,
  });
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  // Upload images to Auto Drive
  const uploadImages = async (files: File[]): Promise<string[]> => {
    setIsUploading(true);
    const totalFiles = files.length;
    let completedFiles = 0;

    try {
      const uploadPromises = files.map(async (file, index) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Failed to upload image");
        }

        completedFiles++;
        setUploadProgress((prev) => ({
          ...prev,
          images: (completedFiles / totalFiles) * 100,
        }));

        const { cid, url } = await response.json();
        return { cid, url };
      });

      const results = await Promise.all(uploadPromises);
      return results.map((r) => r.cid);
    } catch (error) {
      toast({
        title: "Error uploading images",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Create and upload task metadata
  const createTaskMetadata = async (
    metadata: TaskMetadata
  ): Promise<string> => {
    try {
      setUploadProgress((prev) => ({ ...prev, metadata: 33 }));

      // Convert any BigInt values to strings before JSON serialization
      const serializedMetadata = JSON.parse(
        JSON.stringify(metadata, (_, value) =>
          typeof value === "bigint" ? value.toString() : value
        )
      );

      const response = await fetch("/api/upload/metadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(serializedMetadata),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create metadata");
      }

      setUploadProgress((prev) => ({ ...prev, metadata: 100 }));
      const { cid } = await response.json();
      return cid;
    } catch (error) {
      toast({
        title: "Error creating task metadata",
        description:
          error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
      throw error;
    }
  };

  const resetProgress = () => {
    setUploadProgress({ images: 0, metadata: 0 });
    setIsUploading(false);
  };

  return {
    isUploading,
    uploadProgress,
    uploadImages,
    createTaskMetadata,
    resetProgress,
  };
}
