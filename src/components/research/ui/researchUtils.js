export const STEP_LABELS = {
  queued: "Queued",
  generate_query: "Query generation",
  web_research: "Web research",
  reflection: "Analysis & reflection",
  finalize_answer: "Finalizing answer",
  image_search: "Image search",
  completed: "Completed",
};

export const defaultFormatTime = (ts) => {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString([], {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return String(ts);
  }
};

export const shortText = (text, n = 220) => {
  if (!text) return "";
  const s = String(text).trim();
  return s.length > n ? s.slice(0, n) + "…" : s;
};
