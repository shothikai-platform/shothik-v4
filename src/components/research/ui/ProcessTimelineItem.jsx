"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo } from "react";
import { STEP_LABELS, defaultFormatTime, shortText } from "./researchUtils";

const ProcessTimelineItem = memo(({ ev, isLast, isActive }) => {
  const stepLabel = STEP_LABELS[ev.step] || ev.step || "Step";
  const timestamp = ev.timestamp ? defaultFormatTime(ev.timestamp) : "";
  const messageCandidates = [
    ev.data?.message,
    ev.data?.title,
    ev.data?.text,
    ev.data?.output,
    ev.data?.description,
  ];
  const message = messageCandidates.find(Boolean) || null;

  const badges = [];
  if (ev.data?.sources_gathered?.length)
    badges.push(`${ev.data.sources_gathered.length} sources`);
  if (ev.data?.sources_count) badges.push(`${ev.data.sources_count} sources`);
  if (ev.data?.search_query?.length)
    badges.push(`${ev.data.search_query.length} queries`);
  if (ev.data?.search_queries?.length)
    badges.push(`${ev.data.search_queries.length} queries`);
  if (ev.data?.images_found !== undefined)
    badges.push(`${ev.data.images_found} images`);

  return (
    <div className="relative flex gap-3 pb-4">
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full shadow-none",
            isActive ? "bg-primary animate-pulse" : "bg-muted-foreground/40",
          )}
        />
        {!isLast && <div className="bg-border w-0.5 flex-1" />}
      </div>

      {/* Timeline Content */}
      <div className="flex-1 py-1">
        <Card className="mb-1 rounded">
          <CardContent className="pt-1 pb-3">
            <div className="flex justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-semibold">
                  <span
                    className={cn(
                      "relative inline-block overflow-hidden",
                      isLast && "animate-shine",
                    )}
                  >
                    {stepLabel}
                  </span>
                </p>

                {message && (
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    {shortText(message, 260)}
                  </p>
                )}

                {Array.isArray(ev.data?.search_query) &&
                  ev.data.search_query.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {ev.data.search_query.slice(0, 3).map((q, i) => (
                        <Badge key={i} variant="outline">
                          {shortText(q, 40)}
                        </Badge>
                      ))}
                      {ev.data.search_query.length > 3 && (
                        <Badge variant="default">
                          +{ev.data.search_query.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
              </div>

              <div className="ml-1 flex flex-col items-end">
                <span className="text-muted-foreground text-xs">
                  {timestamp}
                </span>

                <div className="mt-0.5 flex flex-wrap justify-end gap-0.5">
                  {badges.slice(0, 3).map((b, i) => (
                    <Badge key={i} variant="outline">
                      {b}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

ProcessTimelineItem.displayName = "ProcessTimelineItem";

export default ProcessTimelineItem;
