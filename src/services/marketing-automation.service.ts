import api from "@/lib/api";

// Campaign API functions
export const campaignAPI = {
  // Get initial campaign suggestions
  getInitialSuggestions: async (projectId: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/initial-suggestions/${projectId}`,
    );
    return response.data;
  },

  // Chat with AI (with memory)
  chat: async (projectId: string, message: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/chat/${projectId}`,
      {
        message,
      },
    );
    return response.data;
  },

  // Get chat history
  getChatHistory: async (projectId: string) => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/chat-history/${projectId}`,
    );
    return response.data;
  },

  // Clear chat history
  clearChatHistory: async (projectId: string) => {
    const response = await api.delete(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/chat-history/${projectId}`,
    );
    return response.data;
  },

  // Save campaign data
  saveCampaignData: async (
    projectId: string,
    data: {
      campaigns: any[];
      adSets: any[];
      ads: any[];
      personas: any[];
    },
  ) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/data/${projectId}`,
      data,
    );
    return response.data;
  },

  // Get campaign data
  getCampaignData: async (projectId: string) => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/data/${projectId}`,
    );
    return response.data;
  },

  // Generate ad copy
  generateAd: async (params: {
    product: string;
    persona: string;
    awareness_stage: string;
    format: string;
    angle?: string;
  }) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/generate-ad`,
      params,
    );
    return response.data;
  },

  // Improve ad copy
  improveAd: async (projectId: string, currentAd: any, feedback: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/improve-ad/${projectId}`,
      {
        currentAd,
        feedback,
      },
    );
    return response.data;
  },

  // Publish ads to Meta platforms
  publishAds: async (
    projectId: string,
    adIds: string[],
    pageId: string,
    adAccountId: string,
    pixelId?: string,
    businessAccountId?: string,
    ctasWithUrls?: Array<{ cta: string; url: string }>,
  ) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/publish-ads/${projectId}`,
      {
        adIds,
        pageId,
        adAccountId,
        pixelId,
        businessAccountId,
        ctasWithUrls,
      },
    );
    return response.data;
  },
};

// Media API functions
export const mediaAPI = {
  // Generate media for a specific ad
  generateMedia: async (projectId: string, adId: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}media/generate/${projectId}/${adId}`,
    );
    return response.data;
  },

  // Generate media for multiple ads
  generateMediaBatch: async (projectId: string, adIds: string[]) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}media/generate-batch/${projectId}`,
      {
        adIds,
      },
    );
    return response.data;
  },

  // Regenerate media with custom prompt
  regenerateMedia: async (
    projectId: string,
    adId: string,
    prompt: string,
    selectedRegions?: Array<{
      x: number;
      y: number;
      width: number;
      height: number;
    }>,
  ) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}media/regenerate/${projectId}/${adId}`,
      {
        prompt,
        selectedRegions,
      },
    );
    return response.data;
  },

  // Save uploaded media to ad
  saveUploadedMedia: async (
    projectId: string,
    adId: string,
    mediaUrl: string,
    mediaType: "image" | "video",
  ) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}media/save/${projectId}/${adId}`,
      {
        mediaUrl,
        mediaType,
      },
    );
    return response.data;
  },

  // Get ImageKit authentication parameters
  getImageKitAuth: async () => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}imagekit/auth`,
    );
    return response.data;
  },

  // Search cities for targeting
  searchCities: async (query: string, country: string = "BD") => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/search-cities?q=${encodeURIComponent(
        query,
      )}&country=${country}`,
    );
    return response.data;
  },

  // Get common Bangladesh cities with real Meta API keys
  getCommonCities: async () => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/common-cities`,
    );
    return response.data;
  },
};

// Meta/Facebook API functions
export const metaAPI = {
  // Initiate Facebook authentication
  initiateAuth: async () => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/facebook`,
    );
    return response.data;
  },

  // Get user's Facebook data
  getUserData: async () => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/user-data`,
    );
    return response.data;
  },

  // Update user's page and business account selections
  updateSelections: async (data: {
    selectedPageIds: string[];
    selectedBusinessAccountId: string;
    selectedAdsAccountId: string;
  }) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/update-selections`,
      data,
    );
    return response.data;
  },

  // Get pixels for a business account
  getPixels: async (businessAccountId: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}campaign/pixels`,
      {
        businessAccountId,
      },
    );
    return response.data;
  },

  getWebhookStatus: async (pageId: string) => {
    const response = await api.get(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/webhook/status/${pageId}`,
    );
    return response.data;
  },

  subscribeWebhook: async (pageId: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/webhook/subscribe`,
      {
        pageId,
      },
    );
    return response.data;
  },

  // Unsubscribe a page from webhook
  unsubscribeWebhook: async (pageId: string) => {
    const response = await api.post(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/webhook/unsubscribe`,
      {
        pageId,
      },
    );
    return response.data;
  },

  // Disconnect Facebook account
  disconnect: async () => {
    const response = await api.delete(
      `${process.env.NEXT_PUBLIC_MARKETING_REDIRECT_PREFIX}connect/facebook`,
    );
    return response.data;
  },
};

export default api;
