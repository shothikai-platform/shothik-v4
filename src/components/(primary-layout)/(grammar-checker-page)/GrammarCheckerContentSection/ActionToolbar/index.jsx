"use client";

import { Copy, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Utility to count words and sentences
const countWordsAndSentences = (text = "") => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const sentences = text.split(/[.!?।॥\n]+/).filter(Boolean).length;

  const totalSentences = sentences > 0 ? sentences : words > 0 ? 1 : 0;

  return { words, sentences: totalSentences };
};

const ActionToolbar = ({ text, handleCopy, handleClear }) => {
  const { words, sentences } = countWordsAndSentences(text);
  const [copied, setCopied] = useState(false);

  const onCopyClick = () => {
    handleCopy();
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <>
      <div className="text-muted-foreground shrink-0 text-xs">
        <span className="hidden xl:inline">{sentences} /</span> {words} Words
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClear}
            aria-label="Delete text"
            className="hover:bg-muted focus-visible:ring-ring flex size-8 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none"
          >
            <Trash2 className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Delete text</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onCopyClick}
            aria-label={copied ? "Copied!" : "Copy text"}
            className="hover:bg-muted focus-visible:ring-ring hidden size-8 items-center justify-center rounded focus-visible:ring-2 focus-visible:outline-none lg:flex"
          >
            <Copy className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied!" : "Copy text"}</TooltipContent>
      </Tooltip>
    </>
  );
};

export default ActionToolbar;
