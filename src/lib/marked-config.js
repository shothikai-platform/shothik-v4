import { marked } from "marked";

// Configure marked options globally
marked.setOptions({
  breaks: true,
  gfm: true,
});

export { marked };
