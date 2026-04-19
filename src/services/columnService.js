import { API_BASE_URL } from "../config/env.js";

function normalizeTabs(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
  }));
}

function normalizeArticles(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    title: item.title,
    date: item.date,
    image: item.image,
    tags: Array.isArray(item.tags) ? item.tags : [],
  }));
}

function normalizePagination(pagination) {
  return {
    limit: Number(pagination?.limit ?? 0),
    offset: Number(pagination?.offset ?? 0),
    total: Number(pagination?.total ?? 0),
    hasMore: Boolean(pagination?.hasMore),
  };
}

function normalizeArticleDetail(article) {
  return {
    id: article?.id,
    title: article?.title ?? "",
    date: article?.date ?? "",
    image: article?.image ?? "",
    tags: Array.isArray(article?.tags) ? article.tags : [],
    content: article?.content ?? "",
  };
}

export const columnService = {
  async getColumns({ limit = 8, offset = 0, signal } = {}) {
    const searchParams = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/columns?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to load columns: ${response.status}`);
    }

    const payload = await response.json();

    return {
      tabs: normalizeTabs(payload.tabs),
      articles: normalizeArticles(payload.articles),
      pagination: normalizePagination(payload.pagination),
    };
  },

  async createColumn({ userId, title, content, imageUrl }) {
    const response = await fetch(`${API_BASE_URL}/api/v1/columns`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Number(userId),
        title,
        content,
        imageUrl: imageUrl?.trim() ? imageUrl.trim() : null,
      }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? `Failed to create column: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeArticleDetail(payload.article);
  },
};