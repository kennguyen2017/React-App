import { LineChart } from "../components/LineChart.jsx";
import { chartData, mealCards, recommendCards, topSummary } from "../data/topData.js";

export function TopPage() {
  return (
    <>
      <section className="hero-panel">
        <div className="hero-progress" style={{ "--progress": topSummary.achievementRate }}>
          <div className="hero-progress-inner">
            <span className="hero-date">{topSummary.date}</span>
            <span className="hero-rate">{topSummary.achievementRate}%</span>
          </div>
        </div>
        <div className="hero-metrics">
          <h1>Health Dashboard</h1>
          <p>Build strong daily habits with small wins.</p>
          <ul className="hero-metric-list">
            <li>Burned kcal: {topSummary.burnedKcal}</li>
            <li>Exercise: {topSummary.exerciseMinutes} min</li>
          </ul>
        </div>
      </section>

      <section className="meal-grid">
        {mealCards.map((meal) => (
          <article className="meal-card" key={meal.id}>
            <img src={meal.image} alt={meal.timeLabel} />
            <div className="meal-tag">{meal.timeLabel}</div>
          </article>
        ))}
      </section>

      <section className="section-block">
        <h2>Monthly Body Record</h2>
        <LineChart data={chartData} />
      </section>

      <section className="exercise-grid">
        {recommendCards.map((card) => (
          <article className="exercise-card" key={card.id}>
            <img src={card.image} alt={card.title} />
            <div className="exercise-overlay"></div>
            <div className="exercise-content">
              <h3>{card.title}</h3>
              <p>{card.subtitle}</p>
              <div className="exercise-tags">{card.tags.join(" ")}</div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
