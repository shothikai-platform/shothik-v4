"use client";

import { cn } from "@/lib/utils";
import Marked from "marked-react";
import { useState } from "react";
import CombinedActions from "./CombinedActions";
import ReferenceModal from "./ReferenceModal";
import SourcesGrid from "./SourcesGrid";

const ResearchContentWithReferences = ({
  content,
  sources = [],
  isLastData,
  isDataGenerating,
  title = "Research Results",
  agentId,
  onSwitchToSourcesTab,
}) => {
  const [selectedReference, setSelectedReference] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [hoverTimeout, setHoverTimeout] = useState(null);

  // Handle feedback submission
  const handleFeedback = async (feedbackType) => {
    try {
      // You can implement your feedback API call here
      // Example: await submitFeedback({ type: feedbackType, content, sources });
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  const handleReferenceHover = (reference, event) => {
    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }

    setSelectedReference(reference);
    setAnchorEl(event.currentTarget);
    setModalOpen(true);
  };

  const handleReferenceLeave = () => {
    // Add a small delay to prevent flickering
    const timeout = setTimeout(() => {
      setModalOpen(false);
      setSelectedReference(null);
      setAnchorEl(null);
    }, 100);
    setHoverTimeout(timeout);
  };

  // Handle content - it might be an object with text property or a string
  let contentStr = "";
  if (typeof content === "string") {
    contentStr = content;
  } else if (typeof content === "object" && content !== null) {
    // If content is an object, try to extract the text content
    contentStr =
      content.text || content.content || content.result || content.answer || "";
  } else {
    contentStr = String(content || "");
  }

  // Clean any [object Object] strings from the content
  contentStr = contentStr.replace(/\[object Object\]/g, "");

  // Convert [1], [1, 2] patterns to markdown links with reference scheme
  // Pattern: [1] -> [ [1] ](reference:1)
  // Pattern: [1, 2] -> [ [1, 2] ](reference:1,2)
  const processedContent = contentStr.replace(
    /\[(\d+(?:,\s*\d+)*)\]/g,
    (match, numbers) => {
      const cleanNumbers = numbers.replace(/\s/g, "");
      return `[${match}](reference:${cleanNumbers})`;
    }
  );

  const renderer = {
    link(href, text) {
      if (href && href.startsWith("reference:")) {
        const refNumbers = href
          .replace("reference:", "")
          .split(",")
          .map((n) => parseInt(n));

        return (
          <span className="inline-block">
            {refNumbers.map((refNum, idx) => {
              const sourceExists = sources.some(
                (source) => source.reference === refNum
              );

              if (sourceExists) {
                return (
                  <span
                    key={refNum}
                    className="reference-link inline-block relative cursor-pointer rounded px-0.5 py-px font-medium text-primary underline transition-all duration-200 hover:bg-primary/10"
                    onMouseEnter={(e) => handleReferenceHover(refNum, e)}
                    onMouseLeave={handleReferenceLeave}
                  >
                    [{refNum}]
                    {idx < refNumbers.length - 1 ? ", " : ""}
                  </span>
                );
              }
              return (
                <span key={refNum}>
                  [{refNum}]
                  {idx < refNumbers.length - 1 ? ", " : ""}
                </span>
              );
            })}
          </span>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      );
    },
    // Ensure headings have consistent styling
    heading(children, level) {
      const Tag = `h${level}`;
      const sizes = {
        1: "text-2xl",
        2: "text-xl",
        3: "text-lg",
        4: "text-base",
        5: "text-sm",
        6: "text-xs",
      };
      return (
        <Tag className={cn("font-bold mb-4", sizes[level])}>{children}</Tag>
      );
    },
    // Ensure blockquotes are styled
    blockquote(children) {
      return (
        <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
          {children}
        </blockquote>
      );
    },
  };

  return (
    <>
      <div className="flex w-full items-start">
        <div
          className={cn(
            "bg-background box-border w-full max-w-full flex-1 border-none px-3 py-2 shadow-none",
            isLastData && isDataGenerating
              ? "mb-2 sm:mb-9 md:mb-2"
              : "mb-[4.75rem] sm:mb-9 md:mb-2",
          )}
        >
          {/* Sources Grid - Display at the top like Perplexity */}
          {sources && sources.length > 0 && (
            <SourcesGrid
              sources={sources}
              onViewAllSources={onSwitchToSourcesTab}
            />
          )}

          <div
            className={cn(
              "prose max-w-none dark:prose-invert",
              "prose-headings:font-bold prose-headings:break-words",
              "prose-p:mb-4 prose-p:break-words prose-p:hyphens-auto",
              "prose-a:text-primary prose-a:break-all",
              "prose-code:bg-muted-foreground/10 prose-code:rounded prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:break-all prose-code:before:content-none prose-code:after:content-none",
              "prose-pre:bg-muted-foreground/10 prose-pre:p-3 prose-pre:rounded-lg",
              "prose-img:rounded-lg prose-img:max-w-full",
              "prose-th:p-2 prose-th:text-left prose-td:p-2",
            )}
          >
            <Marked renderer={renderer} breaks={true} gfm={true}>
              {processedContent}
            </Marked>
          </div>

          <span className="text-muted-foreground mt-1 block text-right text-[0.6rem] sm:text-xs" />

          {/* Combined Sharing and Feedback Actions */}
          <CombinedActions
            content={processedContent}
            sources={sources}
            title={title}
            onFeedback={handleFeedback}
            agentId={agentId}
          />
        </div>
      </div>

      <ReferenceModal
        open={modalOpen}
        onClose={handleReferenceLeave}
        reference={selectedReference}
        sources={sources}
        anchorEl={anchorEl}
      />
    </>
  );
};

export default ResearchContentWithReferences;
