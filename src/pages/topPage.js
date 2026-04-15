import { chartData, topSummary } from "../data/topData.js";
import { renderSimpleChart } from "../components/chart.js";

export function renderTopPage() {
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
      </div>
    </section>
    <section class="section-block">
      <h2>Monthly Body Record</h2>
      ${renderSimpleChart(chartData)}
    </section>
    <section class="section-block placeholder-note">
      <p>Top page detailed components will be added in Task 2.</p>
    </section>
  `;
}
