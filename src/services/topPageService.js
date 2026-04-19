import { API_BASE_URL, TOP_PAGE_USER_ID } from "../config/env.js";

const ACTION_ICON_MAP = {
  sun: "☀",
  meal: "🍽",
  fork: "🍴",
  coffee: "☕",
};

function normalizeSummary(summary) {
  return {
    date: summary?.date ?? "",
    achievementRate: summary?.achievementRate ?? 0,
    burnedKcal: summary?.burnedKcal ?? 0,
    exerciseMinutes: summary?.exerciseMinutes ?? 0,
  };
}

function normalizeMealCards(cards) {
  return (Array.isArray(cards) ? cards : []).map((card) => ({
    id: card.id,
    timeLabel: card.timeLabel,
    image: card.image,
    stamp: card.stamp,
    name: card.name,
  }));
}

function normalizeTopActions(actions) {
  return (Array.isArray(actions) ? actions : []).map((action) => ({
    id: action.id,
    title: action.title,
    icon: ACTION_ICON_MAP[action.icon] ?? action.icon ?? "•",
  }));
}

function normalizeChartData(points) {
  return (Array.isArray(points) ? points : []).map((point) => ({
    month: point.month,
    weight: point.weight,
    fat: point.fat,
  }));
}

export const topPageService = {
  async getTopPage({ signal } = {}) {
    const response = await fetch(`${API_BASE_URL}/api/v1/top?user_id=${TOP_PAGE_USER_ID}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to load top page data: ${response.status}`);
    }

    const payload = await response.json();

    return {
      summary: normalizeSummary(payload.summary),
      mealCards: normalizeMealCards(payload.mealCards),
      topActions: normalizeTopActions(payload.topActions),
      chartData: normalizeChartData(payload.chartData),
      source: "api",
    };
  },
};