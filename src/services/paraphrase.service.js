const API_BASE = process.env.NEXT_PUBLIC_API_URL_WITH_PREFIX;

export const detectAutoFreezeTerms = async ({
  text,
  language = "en",
  useLLM = false,
  accessToken = null,
}) => {
  try {
    const response = await fetch(`${API_BASE}/auto-freeze/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ text, language, useLLM }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Detection failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Auto-freeze detection error:", error);
    throw error;
  }
};

/**
 * Disable auto-freeze for a term
 */
export const disableAutoFreezeTerm = async (term, accessToken) => {
  try {
    const response = await fetch(`${API_BASE}/auto-freeze/disable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ term }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to disable");
    }

    return await response.json();
  } catch (error) {
    console.error("Disable auto-freeze error:", error);
    throw error;
  }
};

/**
 * Enable auto-freeze for a term
 */
export const enableAutoFreezeTerm = async (term, accessToken) => {
  try {
    const response = await fetch(`${API_BASE}/auto-freeze/enable`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ term }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to enable");
    }

    return await response.json();
  } catch (error) {
    console.error("Enable auto-freeze error:", error);
    throw error;
  }
};

/**
 * Get user's disabled terms
 */
export const getDisabledTerms = async (accessToken) => {
  try {
    const response = await fetch(`${API_BASE}/auto-freeze/disabled-terms`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch");
    }

    return await response.json();
  } catch (error) {
    console.error("Get disabled terms error:", error);
    throw error;
  }
};
