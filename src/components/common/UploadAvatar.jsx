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
  errorMessage,
}) {
  const uniqueId = useId();
  const inputId = `avatar-input-${uniqueId}`;
  const helperId = helperText ? `avatar-helper-${uniqueId}` : undefined;
  const errorId = errorMessage ? `avatar-error-${uniqueId}` : undefined;

  const describedBy = [helperId, errorId].filter(Boolean).join(" ");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onDrop(selectedFile);
    }
  };

  return (
    <>
      <label
        htmlFor={inputId}
        className={cn(
          "relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-dashed transition-all focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          loading ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-muted/80",
          error || errorMessage
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
          aria-describedby={describedBy || undefined}
          aria-invalid={!!error || !!errorMessage}
          aria-errormessage={errorId}
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
            <span className="text-muted-foreground text-xs">Upload Photo</span>
          </div>
        )}
      </label>

      {helperText && (
        <p
          id={helperId}
          className="text-muted-foreground mt-2 text-center text-xs"
        >
          {helperText}
        </p>
      )}

      {errorMessage && (
        <p
          id={errorId}
          className="text-destructive mt-2 text-center text-sm px-4"
        >
          {errorMessage}
        </p>
      )}
    </>
  );
}
