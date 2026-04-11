"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, Copy, Trash2 } from "lucide-react";
import { useState } from "react";

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

  const onCopy = (e) => {
    handleCopy(e);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="hover:bg-muted flex size-8 items-center justify-center rounded"
            aria-label="Delete text"
          >
            <Trash2 className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">Delete</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onCopy}
            className="hover:bg-muted hidden size-8 items-center justify-center rounded lg:flex"
            aria-label={copied ? "Copied!" : "Copy text"}
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {copied ? "Copied!" : "Copy"}
        </TooltipContent>
      </Tooltip>
    </>
  );
};

export default ActionToolbar;
