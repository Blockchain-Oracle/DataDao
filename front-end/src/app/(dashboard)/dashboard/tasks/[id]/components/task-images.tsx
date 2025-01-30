import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface TaskImage {
  cid: string;
  url?: string;
}

interface TaskImagesProps {
  images: TaskImage[];
}

export function TaskImages({ images }: TaskImagesProps) {
  console.log(images, "images,,,,,,,,,,,,,,,,,,,,,,,,,");
  const [selectedImage, setSelectedImage] = useState<TaskImage | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Task Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div
                key={image.cid}
                className="relative aspect-square cursor-pointer rounded-lg overflow-hidden"
                onClick={() => setSelectedImage(image)}
              >
                <Image
                  src={image.url}
                  alt={`Task image ${index + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedImage}
        onOpenChange={() => setSelectedImage(null)}
      >
        <DialogContent className="max-w-3xl">
          {selectedImage && (
            <div className="relative aspect-video">
              <Image
                src={selectedImage.url}
                alt="Task image"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 75vw"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
