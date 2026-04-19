import { API_BASE_URL } from "../config/env.js";

function normalizeHighlights(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    title: item.title,
    subtitle: item.subtitle,
    image: item.image,
  }));
}

function normalizeChartFilters(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    id: item.id,
    label: item.label,
  }));
}

function normalizeChartData(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    month: item.month,
    weight: item.weight,
    fat: item.fat,
  }));
}

function normalizeExerciseItems(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    name: item.name,
    kcal: item.kcal,
    duration: item.duration,
  }));
}

function normalizeDiaryEntries(items) {
  return (Array.isArray(items) ? items : []).map((item) => ({
    date: item.date,
    time: item.time,
    content: item.content,
  }));
}

function normalizeMyRecordPage(payload) {
  return {
    highlights: normalizeHighlights(payload.highlights),
    chartDate: payload.chartDate ?? "",
    chartFilters: normalizeChartFilters(payload.chartFilters),
    chartData: normalizeChartData(payload.chartData),
    exerciseDate: payload.exerciseDate ?? "",
    exerciseItems: normalizeExerciseItems(payload.exerciseItems),
    diaryEntries: normalizeDiaryEntries(payload.diaryEntries),
  };
}

export const myRecordService = {
  async getMyRecord({ userId, signal } = {}) {
    const searchParams = new URLSearchParams({
      user_id: String(userId ?? 3),
    });

    const response = await fetch(`${API_BASE_URL}/api/v1/my-record?${searchParams.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to load my record data: ${response.status}`);
    }

    const payload = await response.json();
    return normalizeMyRecordPage(payload);
  },

  async createMyRecord(request) {
    const response = await fetch(`${API_BASE_URL}/api/v1/my-record`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new Error(payload?.message ?? `Failed to create my record: ${response.status}`);
    }

    return response.json();
  },
};