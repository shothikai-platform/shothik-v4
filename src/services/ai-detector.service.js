import api from "@/lib/api";

// Check
export const aiDetectorCheck = async (payload = {}, signal) => {
  const response = await api.post(
    "/ai-detector/check",
    { ...payload },
    { signal },
  );
  return response?.data;
};

// Sections
export const fetchAiDetectorSections = async (query = {}, payload = {}) => {
  const queryParams = new URLSearchParams();
  const { page = 1, limit = 10, search = "" } = query;
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("search", search.trim());

  const response = await api.get(`/api/ai-detector/sections?${queryParams}`, {
    ...payload,
  });
  return response?.data;
};

export const fetchAiDetectorSection = async (id, payload = {}) => {
  const response = await api.get(`/api/ai-detector/section/${id}`, {
    ...payload,
  });
  return response?.data;
};

export const renameAiDetectorSection = async (id, payload = {}) => {
  const response = await api.put(`/api/ai-detector/section-rename/${id}`, {
    ...payload,
  });
  return response?.data;
};

export const deleteAiDetectorSection = async (id, payload = {}) => {
  const response = await api.delete(`/api/ai-detector/section-delete/${id}`, {
    ...payload,
  });
  return response?.data;
};

// History
export const fetchAiDetectorHistories = async (query = {}, payload = {}) => {
  const queryParams = new URLSearchParams();
  const { page = 1, limit = 10, search = "" } = query;
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("search", search.trim());

  const response = await api.get(`/api/ai-detector/histories?${queryParams}`, {
    ...payload,
  });
  return response?.data;
};

export const fetchAiDetectorHistory = async (id, payload = {}) => {
  const response = await api.get(`/api/ai-detector/history/${id}`, {
    ...payload,
  });
  return response?.data;
};

export const fetchAiDetectorShare = async (id, payload = {}) => {
  const response = await api.get(`/api/ai-detector/share/${id}`, {
    ...payload,
  });
  return response?.data;
};
