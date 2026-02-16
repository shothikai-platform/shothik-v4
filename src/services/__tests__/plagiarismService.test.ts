import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  analyzePlagiarism,
  PlagiarismServiceError,
  QuotaExceededError,
  ServerUnavailableError,
  UnauthorizedError,
} from "../plagiarismService";

const buildFetchResponse = ({
  ok,
  status,
  json,
}: {
  ok: boolean;
  status: number;
  json: unknown;
}) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(json),
  text: vi.fn().mockResolvedValue(JSON.stringify(json)),
});

describe("plagiarismService", () => {
  const token = "test-token";
  const text = "Sample text to analyze.";

  beforeEach(() => {
    vi.restoreAllMocks();
    // Stub environment variables to match test expectation
    vi.stubEnv("NEXT_PUBLIC_API_URL", "https://api-qa.shothik.ai");
    vi.stubEnv("NEXT_PUBLIC_PLAGIARISM_REDIRECT_PREFIX", "check");
  });

  it("sends request and normalizes successful response", async () => {
    const rawResponse = {
      overallSimilarity: 0.81,
      paraphrasedSections: [
        {
          text: "Excerpt",
          similarity: 0.5,
          startChar: 0,
          endChar: 20,
          sources: [
            {
              title: "Source Title",
              url: "https://example.com",
              snippet: "Snippet",
              matchType: "paraphrased",
              confidence: "HIGH",
              similarity: 0.75,
              isPlagiarism: true,
              reason: "Matched content",
            },
          ],
        },
      ],
      summary: {
        paraphrasedCount: 1,
        exactMatchCount: 0,
        riskLevel: "MEDIUM",
      },
      timestamp: "2025-11-09T00:00:00.000Z",
      hasPlagiarism: true,
      needsReview: true,
    };

    const fetchSpy = vi
      .spyOn(globalThis, "fetch" as any)
      .mockResolvedValue(
        buildFetchResponse({ ok: true, status: 200, json: rawResponse }),
      );

    // Re-import module to pick up new env vars?
    // No, DEFAULT_API_BASE is calculated at module load time.
    // So stubEnv might not work if module is already loaded.
    // I should pass baseUrl explicitly in test OR use vi.resetModules() but that's complex with imports.

    // Easier: pass baseUrl to analyzePlagiarism in test.
    const baseUrl = "https://api-qa.shothik.ai/check";
    const result = await analyzePlagiarism({ text, token, baseUrl });

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api-qa.shothik.ai/check/plagiarism/analyze",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text }),
      }),
    );

    expect(result).toEqual({
      score: 81,
      riskLevel: "MEDIUM",
      analyzedAt: rawResponse.timestamp,
      analysisId: undefined,
      language: undefined,
      citations: [],
      exactMatches: [],
      exactPlagiarismPercentage: 0,
      sources: [],
      sections: [
        {
          similarity: 50,
          excerpt: "Excerpt",
          span: { start: 0, end: 20 },
          sources: [
            {
              title: "Source Title",
              url: "https://example.com",
              snippet: "Snippet",
              matchType: "paraphrased",
              confidence: "high",
              similarity: 75,
              isPlagiarism: true,
              reason: "Matched content",
            },
          ],
        },
      ],
      summary: {
        paraphrasedCount: 1,
        paraphrasedPercentage: 100,
        exactMatchCount: 0,
        totalChunks: 1,
      },
      flags: {
        hasPlagiarism: true,
        needsReview: true,
      },
    });
  });

  it("throws UnauthorizedError for 401 responses", async () => {
    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue(
      buildFetchResponse({
        ok: false,
        status: 401,
        json: { message: "Unauthorized" },
      }),
    );

    await expect(analyzePlagiarism({ text, token })).rejects.toBeInstanceOf(
      UnauthorizedError,
    );
  });

  it("throws QuotaExceededError for 429 responses", async () => {
    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue(
      buildFetchResponse({
        ok: false,
        status: 429,
        json: { message: "Too Many Requests" },
      }),
    );

    await expect(analyzePlagiarism({ text, token })).rejects.toBeInstanceOf(
      QuotaExceededError,
    );
  });

  it("throws ServerUnavailableError for 500 responses", async () => {
    vi.spyOn(globalThis, "fetch" as any).mockResolvedValue(
      buildFetchResponse({
        ok: false,
        status: 503,
        json: { message: "Service Unavailable" },
      }),
    );

    await expect(analyzePlagiarism({ text, token })).rejects.toBeInstanceOf(
      ServerUnavailableError,
    );
  });

  it("throws validation error when text is empty", async () => {
    await expect(
      analyzePlagiarism({ text: "  ", token }),
    ).rejects.toBeInstanceOf(PlagiarismServiceError);
  });
});
