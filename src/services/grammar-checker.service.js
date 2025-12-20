import api from "@/lib/api";

// Check
export const grammarCheck = async (payload = {}, signal) => {
  const response = await api.post(
    "/api/grammar/check",
    { ...payload },
    { signal },
  );
  return response?.data;
};

// Sections
export const fetchGrammarSections = async (query = {}, payload = {}) => {
  const queryParams = new URLSearchParams();
  const { page = 1, limit = 10, search = "" } = query;
  queryParams.set("page", page.toString());
  queryParams.set("limit", limit.toString());
  queryParams.set("search", search.trim());

  const response = await api.get(`/api/grammar/sections?${queryParams}`, {
    ...payload,
  });
  return response?.data;
};

export const fetchGrammarSection = async (id, payload = {}) => {
  const response = await api.get(`/api/grammar/section/${id}`, { ...payload });
  return response?.data;
};

export const renameGrammarSection = async (id, payload = {}) => {
  const response = await api.put(`/api/grammar/section-rename/${id}`, {
    ...payload,
  });
  return response?.data;
};

export const deleteGrammarSection = async (id, payload = {}) => {
  const response = await api.delete(`/api/grammar/section-delete/${id}`, {
    ...payload,
  });
  return response?.data;
};
