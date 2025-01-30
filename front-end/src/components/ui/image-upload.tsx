"use client";

import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value: File[];
  onChange: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
}

export function ImageUpload({
  value,
  onChange,
  maxFiles = 2,
  maxSize = 5 * 1024 * 1024, // 5MB default
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    },
    maxFiles,
    maxSize,
    onDrop: (acceptedFiles) => {
      // Create preview URLs
      const newPreviews = acceptedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setPreviews((prev) => [...prev, ...newPreviews]);

      // Update files
      onChange([...value, ...acceptedFiles]);
    },
  });

  const removeFile = (index: number) => {
    const newFiles = [...value];
    newFiles.splice(index, 1);
    onChange(newFiles);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive
            ? "border-primary/50 bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-center">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div className="text-sm">
            <span className="font-semibold">Click to upload</span> or drag and
            drop
          </div>
          <div className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to {maxSize / (1024 * 1024)}MB
            {maxFiles > 1 && ` (Max ${maxFiles} files)`}
          </div>
        </div>
      </div>

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {value.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-video rounded-lg overflow-hidden border bg-muted"
            >
              {previews[index] ? (
                <img
                  src={previews[index]}
                  alt={`Preview ${index + 1}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 text-white text-xs truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
