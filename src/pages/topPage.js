import { chartData, mealCards, recommendCards, topSummary } from "../data/topData.js";
import { renderSimpleChart } from "../components/chart.js";

export function renderTopPage() {
  const mealCardsHtml = mealCards
    .map(
      (meal) => `
        <article class="meal-card">
          <img src="${meal.image}" alt="${meal.timeLabel}" />
          <div class="meal-tag">${meal.timeLabel}</div>
        </article>
      `
    )
    .join("");

  const recommendCardsHtml = recommendCards
    .map(
      (card) => `
        <article class="recommend-card">
          <img src="${card.image}" alt="${card.title}" />
          <div class="recommend-overlay"></div>
          <div class="recommend-content">
            <h3>${card.title}</h3>
            <p>${card.subtitle}</p>
            <div class="recommend-tags">${card.tags.join(" ")}</div>
          </div>
        </article>
      `
    )
    .join("");

  return `
    <section class="hero-panel">
      <div class="hero-progress" style="--progress:${topSummary.achievementRate}">
        <div class="hero-progress-inner">
          <span class="hero-date">${topSummary.date}</span>
          <span class="hero-rate">${topSummary.achievementRate}%</span>
        </div>
      </div>
      <div class="hero-metrics">
        <h1>Health Dashboard</h1>
        <p>Build strong daily habits with small wins.</p>
        <ul class="hero-metric-list">
          <li>Burned kcal: ${topSummary.burnedKcal}</li>
          <li>Exercise: ${topSummary.exerciseMinutes} min</li>
        </ul>
      </div>
    </section>
    <section class="meal-grid">
      ${mealCardsHtml}
    </section>
    <section class="section-block">
      <h2>Monthly Body Record</h2>
      ${renderSimpleChart(chartData)}
    </section>
    <section class="recommend-grid">
      ${recommendCardsHtml}
    </section>
  `;
}
