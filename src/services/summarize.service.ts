import { ENV } from "@/config/env";

const API_BASE = ENV.api_url + "/api";

export class SummarizeServiceError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.name = "SummarizeServiceError";
    this.status = status;
    this.details = details;
  }
}

interface SummarizeRequestParams {
  text: string;
  length?: "short" | "medium" | "long";
  language?: string;
  accessToken?: string | null;
  signal?: AbortSignal;
}

interface SummarizeResponse {
  success: boolean;
  summary?: string;
  original_length?: number;
  summary_length?: number;
  message?: string;
}

const handleFetchError = async (response: Response): Promise<never> => {
  let errorData: { message?: string } = {};
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText || "Request failed" };
  }
  throw new SummarizeServiceError(
    errorData.message || "Request failed",
    response.status,
    errorData
  );
};

export const summarizeText = async ({
  text,
  length = "medium",
  language = "en",
  accessToken = null,
  signal,
}: SummarizeRequestParams): Promise<SummarizeResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}/summarize`, {
    method: "POST",
    headers,
    body: JSON.stringify({ text, length, language }),
    signal,
  });

  if (!response.ok) {
    return handleFetchError(response);
  }

  return await response.json();
};

export const getSummaryStatistics = async (
  text: string,
  accessToken: string,
  signal?: AbortSignal
): Promise<{ success: boolean; stats?: any; message?: string }> => {
  const response = await fetch(`${API_BASE}/summarize/statistics`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ text }),
    signal,
  });

  if (!response.ok) {
    return handleFetchError(response);
  }

  return await response.json();
};