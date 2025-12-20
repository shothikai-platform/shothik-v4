"use client";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

const ButtonCopyText = ({ className, text, onClick, children, ...props }) => {
  const [showCopy, setShowCopy] = useState(true);

  const handleCopy = async (e) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
      setShowCopy(false);
      setTimeout(() => {
        setShowCopy(true);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  };

  return (
    <button
      onClick={(e) => {
        handleCopy(e);
        onClick?.(e);
      }}
      className={cn(
        "flex size-8 cursor-pointer items-center justify-center rounded",
        className,
      )}
      {...props}
    >
      {children ||
        (showCopy ? <Copy className="size-5" /> : <Check className="size-5" />)}
    </button>
  );
};

export default ButtonCopyText;
