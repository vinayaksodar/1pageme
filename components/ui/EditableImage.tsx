"use client";

import React, { useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";
import { useResumeStore } from "@/store/useResumeStore";
import toast from "react-hot-toast";

interface EditableImageProps {
  src?: string;
  onChange: (val: string) => void;
  className?: string;
}

// Simple local cache for images to avoid pulling from Blob unnecessarily
const IMAGE_CACHE_PREFIX = "1pm_img_cache_";

export const EditableImage = ({
  src,
  onChange,
  className,
}: EditableImageProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(src);
  const isAuthenticated = useResumeStore((state) => state.isAuthenticated);

  // Sync displaySrc with src, but check local cache if src is a URL
  useEffect(() => {
    if (!src) {
      setDisplaySrc(undefined);
      return;
    }

    if (src.startsWith("data:")) {
      setDisplaySrc(src);
      return;
    }

    // If it's a URL, check if we have it in local cache
    const cached = localStorage.getItem(IMAGE_CACHE_PREFIX + src);
    if (cached) {
      setDisplaySrc(cached);
    } else {
      setDisplaySrc(src);
    }
  }, [src]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // 1. Compression Options
      const options = {
        maxSizeMB: 0.1, // 100KB max
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };

      // 2. Compress the image
      const compressedFile = await imageCompression(file, options);

      // 3. Convert to Data URL for local caching/immediate preview
      const base64 = await imageCompression.getDataUrlFromFile(compressedFile);

      // 4. Update local state immediately for "caching" and smooth UI
      onChange(base64);
      setDisplaySrc(base64);

      // 5. If authenticated, upload to Vercel Blob
      if (isAuthenticated) {
        try {
          const filename = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
          const response = await fetch(
            `/api/upload?filename=${encodeURIComponent(filename)}`,
            {
              method: "POST",
              body: compressedFile,
            },
          );

          if (!response.ok) {
            throw new Error("Failed to upload to cloud storage");
          }

          const blob = await response.json();
          const cloudUrl = blob.url;

          // Cache the base64 against the cloud URL to avoid pulling it back
          try {
            localStorage.setItem(IMAGE_CACHE_PREFIX + cloudUrl, base64);
          } catch {
            console.warn(
              "Failed to cache image in localStorage (likely quota exceeded)",
            );
          }

          // Update with the permanent cloud URL
          onChange(cloudUrl);
          // Ensure we clear any previous sync failure if this one succeeded
          useResumeStore.setState({ lastSyncFailed: false });
        } catch (uploadError) {
          console.error(
            "Cloud upload failed, using local version:",
            uploadError,
          );
          toast.error("Cloud upload failed, but image saved locally.");
          // Set sync failed so the user sees the CloudOff icon
          useResumeStore.setState({ lastSyncFailed: true });
        }
      }
    } catch (error) {
      console.error("Image processing error:", error);
      toast.error("Failed to process image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden bg-gray-100 print:bg-transparent",
        className,
      )}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      {displaySrc ? (
        <Image
          src={displaySrc}
          alt="Profile"
          fill
          style={{ objectFit: "cover" }}
          unoptimized={displaySrc.startsWith("data:")}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          {isUploading ? (
            <Loader2 className="animate-spin" size={24} />
          ) : (
            <Camera size={24} />
          )}
        </div>
      )}

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <Loader2 className="animate-spin text-white" size={24} />
        </div>
      )}

      {!isUploading && (
        <div className="no-print absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Camera size={20} />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};
