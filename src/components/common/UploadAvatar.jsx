import { cn } from "@/lib/utils";
import { Camera } from "lucide-react";
import Image from "next/image";
import React, { useId } from "react";

export default function UploadAvatar({
  error,
  file,
  onDrop,
  helperText,
  loading,
  "aria-describedby": ariaDescribedBy,
  ...other
}) {
  const id = useId();
  const inputId = other.id || id;
  const helperTextId = `${inputId}-helper-text`;

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
          "relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-dashed focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-ring",
          loading ? "cursor-not-allowed" : "cursor-pointer",
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
          aria-invalid={!!error}
          aria-describedby={
            [helperText ? helperTextId : undefined, ariaDescribedBy]
              .filter(Boolean)
              .join(" ") || undefined
          }
          {...other}
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
          id={helperTextId}
          className="text-destructive mt-2 text-center text-xs"
        >
          {helperText}
        </p>
      )}
    </>
  );
}
