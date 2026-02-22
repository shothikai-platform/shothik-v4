"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { marked } from "marked";
import React, { memo } from "react";
import { useSelector } from "react-redux";
import ResearchContentWithReferences from "../../tools/research/ResearchContentWithReferences";

const MessageBubble = ({ message, isLastData, isDataGenerating }) => (
  <div className="flex w-full items-start">
    <div
      className={cn(
        "bg-background box-border w-full max-w-full flex-1 border-none px-3 py-2 shadow-none",
        isLastData && isDataGenerating
          ? "mb-2 sm:mb-9 md:mb-2"
          : "mb-[4.75rem] sm:mb-9 md:mb-2",
      )}
    >
      <div
        className={cn(
          "w-full max-w-full",
          "prose max-w-none dark:prose-invert",
          "prose-p:mb-4 prose-p:break-words prose-p:hyphens-auto",
          "prose-headings:font-bold prose-headings:break-words",
          "prose-h1:text-2xl prose-h1:mb-4",
          "prose-h2:text-xl prose-h2:mb-4",
          "prose-h3:text-lg prose-h3:mb-4",
          "prose-h4:text-base prose-h4:mb-4",
          "prose-p:mb-4 prose-p:break-words prose-p:hyphens-auto",
          "prose-a:text-primary prose-a:break-all",
          "prose-code:bg-muted-foreground/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:break-all prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-muted-foreground/10 prose-pre:p-3 prose-pre:rounded-lg",
          "prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-muted-foreground",
          "prose-img:rounded-lg prose-img:max-w-full",
          "prose-th:p-2 prose-th:text-left prose-td:p-2",
        )}
      >
        <div
          className="w-full max-w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: marked(message) }}
        />
      </div>

      {message.sources && message.sources.length > 0 && (
        <div className="mt-2 w-full max-w-full">
          <span className="text-muted-foreground mb-1 block text-xs">
            Sources:
          </span>
          <div className="flex w-full max-w-full flex-wrap gap-1">
            {message.sources.slice(0, 5).map((source, index) => (
              <Badge
                key={index}
                variant="outline"
                className="h-6 max-w-[150px] cursor-pointer overflow-hidden text-[0.6rem] text-ellipsis whitespace-nowrap sm:max-w-none sm:text-[0.7rem]"
                onClick={() => window.open(source.url, "_blank")}
              >
                [{source.reference}] {source.title}
              </Badge>
            ))}
            {message.sources.length > 5 && (
              <Badge
                variant="outline"
                className="h-6 text-[0.6rem] sm:text-[0.7rem]"
              >
                +{message.sources.length - 5} more
              </Badge>
            )}
          </div>
        </div>
      )}

      <span className="text-muted-foreground mt-1 block text-right text-[0.6rem] sm:text-xs">
        {/* {new Date(message.timestamp).toLocaleTimeString()} */}
      </span>
    </div>
  </div>
);

const ResearchContent = memo(({ currentResearch, isLastData, onSwitchTab }) => {
  const researchResult =
    currentResearch?.result || currentResearch?.answer || "";

  // Optimized selectors: Select specific fields instead of full state object
  // to prevent re-renders on every stream event update
  const isDataGenerating = useSelector((state) =>
    Boolean(state.researchCore?.isStreaming || state.researchCore?.isPolling),
  );
  const agentId = useSelector(
    (state) => state.researchChat?.currentChatId,
  );

  // Check if we have sources to use the new component with references
  const hasSources =
    currentResearch?.sources && currentResearch.sources.length > 0;

  return (
    <div className="w-full max-w-full overflow-hidden">
      {hasSources ? (
        <ResearchContentWithReferences
          content={researchResult}
          sources={currentResearch.sources}
          isLastData={isLastData}
          isDataGenerating={isDataGenerating}
          agentId={agentId}
          onSwitchToSourcesTab={() => onSwitchTab?.(2)}
        />
      ) : (
        <MessageBubble
          message={researchResult}
          isLastData={isLastData}
          isDataGenerating={isDataGenerating}
        />
      )}
    </div>
  );
});

ResearchContent.displayName = "ResearchContent";

export default ResearchContent;
