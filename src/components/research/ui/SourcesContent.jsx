"use client";

import React, { useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

// Helper functions moved outside component to avoid recreation on every render
const getDomain = (url) => {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
};

const getFaviconUrl = (url) => {
  try {
    const domain = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
};

const getDomainAbbr = (url) => {
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    const parts = domain.split(".");
    if (parts.length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return domain.substring(0, 2).toUpperCase();
  } catch {
    return "??";
  }
};

// Extracted and memoized card component
const SourceCard = React.memo(({ source, onClick }) => {
  return (
    <Card
      className="flex h-full cursor-pointer flex-col transition-all duration-200 ease-in-out hover:-translate-y-px hover:shadow-md"
      onClick={() => onClick(source.url)}
    >
      <CardContent className="flex-grow p-2">
        <div className="flex items-start gap-1.5">
          <Avatar className="h-6 w-6 shrink-0">
            <AvatarImage src={getFaviconUrl(source.url)} />
            <AvatarFallback className="bg-muted text-foreground text-[0.7rem]">
              {getDomainAbbr(source.url)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1">
            <p className="text-foreground mb-0.5 line-clamp-2 text-sm leading-snug font-medium">
              {source.title || "Untitled Source"}
            </p>

            <span className="text-muted-foreground block truncate text-xs">
              {getDomain(source.url)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

SourceCard.displayName = "SourceCard";

function SourcesContent({ sources }) {
  const handleSourceClick = useCallback((url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  if (!sources || sources.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
        <h6 className="text-muted-foreground text-lg">No Sources Available</h6>
        <p className="text-muted-foreground text-sm">
          No sources were found for this research query
        </p>
      </div>
    );
  }

  return (
    <div className="mb-[4.25rem] min-h-[calc(100dvh-180px)] px-2 py-3 sm:mb-7 sm:min-h-[calc(100dvh-200px)] md:mb-5 md:min-h-[calc(100dvh-230px)] lg:min-h-[calc(100dvh-250px)]">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
        {sources.map((source, index) => (
          <SourceCard
            key={index}
            source={source}
            onClick={handleSourceClick}
          />
        ))}
      </div>
    </div>
  );
}

export default React.memo(SourcesContent);
