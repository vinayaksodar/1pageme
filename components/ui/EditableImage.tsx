"use client";

import React from "react";
import { Camera } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface EditableImageProps {
  src?: string;
  onChange: (val: string) => void;
  className?: string;
}

export const EditableImage = ({
  src,
  onChange,
  className,
}: EditableImageProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={cn(
        "group relative cursor-pointer overflow-hidden bg-gray-100 print:bg-transparent",
        className,
      )}
      onClick={() => fileInputRef.current?.click()}
    >
      {src ? (
        <Image src={src} alt="Profile" fill style={{ objectFit: "cover" }} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-gray-400">
          <Camera size={24} />
        </div>
      )}
      <div className="no-print absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Camera size={20} />
      </div>
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
