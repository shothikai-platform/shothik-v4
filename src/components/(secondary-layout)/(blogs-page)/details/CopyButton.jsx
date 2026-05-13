"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import useSnackbar from "@/hooks/useSnackbar";
import { Check, Copy } from "lucide-react";
import { useState } from "react";

const CopyButton = ({ text }) => {
  const enqueueSnackbar = useSnackbar();
  const [showCopy, setShowCopy] = useState(true);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    enqueueSnackbar("Copied URL");
    setShowCopy(false);
    setTimeout(() => {
      setShowCopy(true);
    }, 2000);
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          aria-label={showCopy ? "Copy URL" : "Copied!"}
        >
          {showCopy ? <Copy className="size-5" /> : <Check className="size-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {showCopy ? "Copy URL" : "Copied!"}
      </TooltipContent>
    </Tooltip>
  );
};

export default CopyButton;
