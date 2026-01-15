"use client";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
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
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            handleCopy(e);
            onClick?.(e);
          }}
          className={cn("size-8", className)}
          aria-label={showCopy ? "Copy text" : "Copied"}
          {...props}
        >
          {children ||
            (showCopy ? (
              <Copy className="size-5" />
            ) : (
              <Check className="size-5" />
            ))}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{showCopy ? "Copy" : "Copied"}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default ButtonCopyText;
