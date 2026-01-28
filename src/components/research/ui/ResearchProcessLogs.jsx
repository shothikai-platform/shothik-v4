"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useMemo } from "react";
import ProcessTimelineItem from "./ProcessTimelineItem";
import { shortText } from "./researchUtils";

/**
 * Timeline UI with clickable sources and a "shine" animation on the last message title.
 *
 * Props:
 *  - streamEvents: array of SSE event objects
 *  - researches: optional meta info
 *  - isStreaming: boolean
 */

const aggregateFromEvents = (events = []) => {
  const summary = { totalSources: 0, totalQueries: 0, researchLoops: 0 };
  const aggregatedSources = [];
  const queries = [];
  events.forEach((ev) => {
    if (ev?.data?.sources_gathered && Array.isArray(ev.data.sources_gathered)) {
      aggregatedSources.push(...ev.data.sources_gathered);
    }
    if (ev?.data?.sources && Array.isArray(ev.data.sources)) {
      aggregatedSources.push(...ev.data.sources);
    }
    if (ev?.data?.sources_count) {
      summary.totalSources = Math.max(
        summary.totalSources,
        ev.data.sources_count,
      );
    }
    if (ev?.data?.search_query && Array.isArray(ev.data.search_query)) {
      queries.push(...ev.data.search_query);
    }
    if (ev?.data?.search_queries && Array.isArray(ev.data.search_queries)) {
      queries.push(...ev.data.search_queries);
    }
    if (ev?.data?.research_loops) {
      summary.researchLoops = Math.max(
        summary.researchLoops,
        ev.data.research_loops,
      );
    }
  });

  // dedupe by url/title if possible
  const uniqueSources = [];
  const seen = new Set();
  aggregatedSources.forEach((s) => {
    const key = (s.url || s.title || JSON.stringify(s)).toString();
    if (!seen.has(key)) {
      seen.add(key);
      uniqueSources.push(s);
    }
  });

  summary.totalSources = Math.max(summary.totalSources, uniqueSources.length);
  summary.totalQueries = queries.length;

  return { summary, uniqueSources, queries };
};

const ResearchProcessLogs = ({
  streamEvents = [],
  researches = [],
  isStreaming = false,
}) => {
  const processed = useMemo(() => {
    if (!Array.isArray(streamEvents) || streamEvents.length === 0) {
      return null;
    }

    let activeIndex = -1;

    if (isStreaming) {
      for (let i = streamEvents.length - 1; i >= 0; i--) {
        if (streamEvents[i].step !== "completed") {
          activeIndex = i;
          break;
        }
      }
    } else {
      activeIndex = streamEvents.length - 1;
    }

    const { summary, uniqueSources, queries } =
      aggregateFromEvents(streamEvents);

    return {
      activeIndex,
      summary,
      uniqueSources,
      queries,
    };
  }, [streamEvents, isStreaming]);

  if (!processed) return null;

  const { activeIndex, summary, uniqueSources, queries } = processed;

  const mainTitle =
    (researches &&
      researches[0] &&
      (researches[0].title || researches[0].name)) ||
    streamEvents[0]?.data?.title ||
    "Research Process";

  return (
    <div className="mb-3">
      {/* Header */}
      <Card className="mb-2 rounded border">
        <CardContent className="p-2">
          <h6 className="mb-0.5 text-lg font-bold">{mainTitle}</h6>

          <div className="mb-1 flex flex-wrap items-center gap-1">
            <span className="text-muted-foreground mr-1 text-sm">
              Searching
            </span>

            {queries && queries.length > 0 ? (
              <>
                {queries.slice(0, 3).map((q, i) => (
                  <Badge key={i} variant="outline">
                    {shortText(q, 36)}
                  </Badge>
                ))}
                {queries.length > 3 && (
                  <Badge variant="default">+{queries.length - 3} more</Badge>
                )}
              </>
            ) : (
              <Badge variant="outline">no queries yet</Badge>
            )}

            <div className="ml-auto flex flex-wrap items-center gap-1">
              {summary.totalSources > 0 && (
                <Badge variant="default">{summary.totalSources} sources</Badge>
              )}
              {summary.totalQueries > 0 && (
                <Badge variant="default">{summary.totalQueries} queries</Badge>
              )}
              {summary.researchLoops > 0 && (
                <Badge variant="default">{summary.researchLoops} loops</Badge>
              )}
            </div>
          </div>

          <Separator className="my-1" />

          {/* Sources preview block with clickable links */}
          <div className="mt-1">
            <p className="text-muted-foreground mb-1 text-sm">
              Reviewing sources — {uniqueSources.length}
            </p>

            <div className="border-border max-h-40 overflow-auto rounded border p-1">
              <div className="space-y-1">
                {uniqueSources.length === 0 && (
                  <span className="text-muted-foreground text-xs">
                    No sources found yet.
                  </span>
                )}

                {uniqueSources.slice(0, 8).map((s, i) => {
                  const title =
                    s.title || s.name || s.label || s.url || "Untitled";
                  const domain = (() => {
                    try {
                      return s.url
                        ? new URL(s.url).hostname.replace("www.", "")
                        : "";
                    } catch {
                      return "";
                    }
                  })();

                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-1"
                    >
                      {s.url ? (
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[13px] font-medium no-underline hover:underline"
                        >
                          {shortText(title, 60)}
                        </a>
                      ) : (
                        <span className="text-[13px] font-medium">
                          {shortText(title, 60)}
                        </span>
                      )}

                      <span className="text-muted-foreground text-xs">
                        {domain}
                      </span>
                    </div>
                  );
                })}

                {uniqueSources.length > 8 && (
                  <span className="text-muted-foreground text-xs">
                    +{uniqueSources.length - 8} more...
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div>
        {streamEvents.map((ev, idx) => (
          <ProcessTimelineItem
            key={`${ev.step}-${ev.timestamp || idx}-${idx}`}
            ev={ev}
            isLast={idx === streamEvents.length - 1}
            isActive={idx === activeIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default ResearchProcessLogs;
