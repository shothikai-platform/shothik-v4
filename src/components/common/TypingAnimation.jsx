"use client";

import { cn } from "@/lib/utils";
import React, { memo } from "react";

const TypingAnimation = memo(({ text = "Thinking..." }) => (
  <div
    className="flex items-center gap-2 px-2 py-4"
    role="status"
    aria-live="polite"
  >
    <div className="flex gap-1" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn("bg-primary h-1.5 w-1.5 rounded-full", "animate-pulse")}
          style={{
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
    <p className="text-muted-foreground text-sm italic">{text}</p>
  </div>
));

TypingAnimation.displayName = "TypingAnimation";

export default TypingAnimation;
