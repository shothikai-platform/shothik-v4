"use client";
import React from 'react';
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-label={showCopy ? "Copy text" : "Copied"}
          onClick={(e) => {
            handleCopy(e);
            onClick?.(e);
          }}
          className={cn(
            "flex size-8 cursor-pointer items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
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
        {showCopy ? "Copy" : "Copied"}
      </TooltipContent>
    </Tooltip>
  );
};

export default ButtonCopyText;
