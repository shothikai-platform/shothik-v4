
/**
 * Processes research content to make references clickable.
 * Replaces patterns like [1], [2, 3] with interactive HTML spans if sources exist.
 *
 * @param {string|object} content - The content to process.
 * @param {Array} sources - List of source objects with 'reference' property.
 * @returns {string} - The processed content with HTML reference links.
 */
export const processResearchContent = (content, sources = []) => {
  let text = content;

  // Ensure text is a string and clean it
  if (!text || typeof text !== "string") {
    if (typeof text === "object" && text !== null) {
      text = text.text || text.content || text.result || text.answer || "";
    } else {
      text = String(text || "");
    }
  }

  // Remove any [object Object] strings that might be in the text
  text = text.replace(/\[object Object\]/g, "");

  // Regular expression to find reference patterns like [1], [2, 9], [12, 13], etc.
  const referenceRegex = /\[(\d+(?:,\s*\d+)*)\]/g;

  return text.replace(referenceRegex, (match, numbers) => {
    const refNumbers = numbers.split(",").map((n) => parseInt(n.trim()));

    // Create clickable spans for each reference
    return refNumbers
      .map((refNum) => {
        const sourceExists = sources.some(
          (source) => source.reference === refNum,
        );
        if (sourceExists) {
          // Note: The classes must match the original component's styling
          return `<span class="reference-link inline-block relative cursor-pointer rounded px-0.5 py-px font-medium text-primary underline transition-all duration-200 hover:bg-primary/10" data-reference="${refNum}">[${refNum}]</span>`;
        }
        return `[${refNum}]`;
      })
      .join("");
  });
};
