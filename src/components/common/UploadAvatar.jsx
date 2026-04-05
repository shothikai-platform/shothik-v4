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
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      onDrop(selectedFile);
    }
  };

  return (
    <>
      <label
        className={cn(
          "has-[:focus-visible]:ring-ring relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-dashed has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-offset-2",
          loading ? "cursor-not-allowed" : "cursor-pointer",
          error
            ? "border-destructive bg-destructive/10"
            : "border-border bg-muted",
        )}
      >
        <input
          type="file"
          accept="image/*"
          className="peer sr-only"
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
            <span className="text-muted-foreground text-xs">Upload Photo</span>
          </div>
        )}
      </label>

      {helperText && (
        <p className="text-destructive mt-2 text-center text-xs">
          {helperText}
        </p>
      )}
    </>
  );
}
