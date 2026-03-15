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

  const handleKeyDown = (event) => {
    if (loading) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.getElementById("avatarInput").click();
    }
  };

  return (
    <>
      <label
        htmlFor="avatarInput"
        role="button"
        tabIndex={loading ? -1 : 0}
        onKeyDown={handleKeyDown}
        className={cn(
          "relative mx-auto flex h-36 w-36 items-center justify-center overflow-hidden rounded-full border border-dashed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          loading ? "cursor-not-allowed" : "cursor-pointer",
          error
            ? "border-destructive bg-destructive/10"
            : "border-border bg-muted",
        )}
        onClick={() =>
          !loading && document.getElementById("avatarInput").click()
        }
      >
        <input
          id="avatarInput"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={loading}
          tabIndex={-1}
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
