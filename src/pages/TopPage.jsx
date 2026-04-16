import { LineChart } from "../components/LineChart.jsx";
import { chartData, mealCards, topActions, topSummary } from "../data/topData.js";

export function TopPage() {
  return (
    <>
      <section className="top-hero">
        <div className="top-hero-visual">
          <img src="./画像/d01.jpg" alt="Healthy meal set" className="top-hero-image" />
          <div className="top-hero-overlay"></div>
          <div className="hero-progress hero-progress-floating" style={{ "--progress": topSummary.achievementRate }}>
            <div className="hero-progress-inner">
              <span className="hero-date">{topSummary.date}</span>
              <span className="hero-rate">{topSummary.achievementRate}%</span>
            </div>
          </div>
        </div>
        <div className="top-hero-chart">
          <div className="top-hero-chart-header">
            <h2>BODY RECORD</h2>
            <p>
              {topSummary.burnedKcal} kcal / {topSummary.exerciseMinutes} min
            </p>
          </div>
          <LineChart data={chartData} />
        </div>
      </section>

      <section className="top-action-strip">
        {topActions.map((action) => (
          <button className="action-chip" key={action.id} type="button">
            <span className="action-chip-icon" aria-hidden="true">
              {action.icon}
            </span>
            <span className="action-chip-label">{action.title}</span>
          </button>
        ))}
      </section>

      <section className="top-meal-history">
        <div className="meal-grid">
          {mealCards.map((meal) => (
            <article className="meal-card" key={meal.id}>
              <img src={meal.image} alt={meal.timeLabel} />
              <div className="meal-tag">{meal.stamp}</div>
            </article>
          ))}
        </div>
        <button className="scroll-top-button" type="button" aria-label="Scroll to top">
          ^
        </button>
      </section>
    </>
  );
}
