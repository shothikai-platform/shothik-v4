"use client";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ButtonCopyText = ({ className, text, onClick, children, disabled, ...props }) => {
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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          onClick={(e) => {
            handleCopy(e);
            onClick?.(e);
          }}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "cursor-not-allowed opacity-50",
            className,
          )}
          aria-label={showCopy ? "Copy text" : "Copied"}
          aria-disabled={disabled}
          {...props}
        >
          {children ||
            (showCopy ? (
              <Copy className="size-5" />
            ) : (
              <Check className="size-5" />
            ))}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{showCopy ? "Copy text" : "Copied!"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ButtonCopyText;
