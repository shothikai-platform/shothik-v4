import React, { useId } from "react";
import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Image from "next/image";

export default function UploadAvatar({
  error,
  file,
  onDrop,
  helperText,
  loading,
}) {
  const inputId = useId();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onDrop(selectedFile);
    }
  };

  return (
    <>
      <div className="group relative mx-auto flex h-36 w-36 items-center justify-center">
        <label
          htmlFor={inputId}
          className={cn(
            "relative flex h-full w-full items-center justify-center overflow-hidden rounded-full border border-dashed transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-muted/50",
            loading ? "cursor-not-allowed opacity-50" : "cursor-pointer",
            error
              ? "border-destructive bg-destructive/10"
              : "border-border bg-muted",
          )}
        >
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleFileChange}
            disabled={loading}
          />

          {file ? (
            <Image
              alt="avatar"
              src={file}
              width={144}
              height={144}
              className="absolute rounded-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Camera className="text-muted-foreground mb-2 h-6 w-6" />
              <span className="text-muted-foreground text-xs">
                Upload Photo
              </span>
            </div>
          )}
        </label>
      </div>

      {helperText && (
        <p className="text-destructive mt-2 text-center text-xs">
          {helperText}
        </p>
      )}
    </>
  );
}
