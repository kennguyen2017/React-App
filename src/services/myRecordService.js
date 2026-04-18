const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8080";
const MY_RECORD_USER_ID = import.meta.env.VITE_MY_RECORD_USER_ID ?? "3";

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

export const myRecordService = {
  async getMyRecord({ signal } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/v1/my-record?user_id=${MY_RECORD_USER_ID}`, {
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

    return {
      highlights: normalizeHighlights(payload.highlights),
      chartDate: payload.chartDate ?? "",
      chartFilters: normalizeChartFilters(payload.chartFilters),
      chartData: normalizeChartData(payload.chartData),
      exerciseDate: payload.exerciseDate ?? "",
      exerciseItems: normalizeExerciseItems(payload.exerciseItems),
      diaryEntries: normalizeDiaryEntries(payload.diaryEntries),
    };
  },
};