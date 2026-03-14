import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "react-toastify";
import { ChevronLeft, ChevronRight, Copy, Check, Download } from "lucide-react";
import { downloadFile } from "../common/downloadfile";

const OutputNavigation = ({
  isMobile,
  setShowIndex,
  showIndex,
  outputs,
  selectedContend,
  handleAiDetectors = () => {},
  loadingAi,
}) => {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(selectedContend);
    toast.success("Copied to clipboard");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const handleDownload = () => {
    downloadFile(selectedContend, "Humanize");
    toast.success("Text Downloaded");
  };

  return (
    <div className="flex flex-row flex-wrap items-center justify-between gap-1">
      <div className="mt-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            variant={isMobile ? "ghost" : "outline"}
            size={isMobile ? "icon" : "default"}
            disabled={!showIndex}
            onClick={() => setShowIndex((prev) => prev - 1)}
            aria-label="Previous draft"
          >
            {isMobile ? <ChevronLeft className="h-4 w-4" /> : "Previous"}
          </Button>

          <span className="text-sm whitespace-nowrap">
            Draft {showIndex + 1} of {outputs}
          </span>

          <Button
            variant={isMobile ? "ghost" : "outline"}
            size={isMobile ? "icon" : "default"}
            disabled={showIndex === outputs - 1}
            onClick={() => setShowIndex((prev) => prev + 1)}
            aria-label="Next draft"
          >
            {isMobile ? <ChevronRight className="h-4 w-4" /> : "Next"}
          </Button>
        </div>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDownload}
                aria-label="download"
              >
                <Download className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Export</span>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                onClick={handleCopy}
                className="min-w-0"
                aria-label={copied ? "Copied!" : "Copy to clipboard"}
              >
                {copied ? (
                  <Check className="mr-1 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                {!isMobile && <span>{copied ? "Copied!" : "Copy"}</span>}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <span>{copied ? "Copied!" : "Copy to clipboard"}</span>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Button
        onClick={() => handleAiDetectors(selectedContend)}
        disabled={loadingAi}
        className="mt-2 h-10 border-2 sm:border-0"
      >
        {loadingAi && (
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        Detect AI
      </Button>
    </div>
  );
};

export default OutputNavigation;
