"use client";

import { Copy, Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
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

  return (
    <>
      <div className="text-muted-foreground shrink-0 text-xs">
        <span className="hidden xl:inline">{sentences} /</span> {words} Words
      </div>

      <TooltipProvider>
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
          <TooltipContent>
            <p>Delete text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleCopy}
              className="hover:bg-muted hidden size-8 items-center justify-center rounded lg:flex"
              aria-label="Copy text"
            >
              <Copy className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy text</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </>
  );
};

export default ActionToolbar;
