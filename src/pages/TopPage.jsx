import { useEffect, useState } from "react";
import { LineChart } from "../components/LineChart.jsx";
import { topPageService } from "../services/topPageService.js";

export function TopPage() {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadTopPage() {
      try {
        setIsLoading(true);
        const result = await topPageService.getTopPage({ signal: abortController.signal });
        setPageData(result);
        setErrorMessage("");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setPageData(null);
        setErrorMessage("Backend Top API is unavailable. Start the backend and seed DB data before opening this page.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadTopPage();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isLoading) {
    return <p className="top-page-status">Loading top page data from backend...</p>;
  }

  if (!pageData) {
    return <p className="top-page-status top-page-status-warning">{errorMessage}</p>;
  }

  const heroMealImage =
    pageData.mealCards.find((meal) => meal.id === "dinner")?.image ?? pageData.mealCards[0]?.image ?? "./画像/d01.jpg";

  return (
    <>
      <section className="top-hero">
        <div className="top-hero-visual">
          <img src={heroMealImage} alt="Healthy meal set" className="top-hero-image" />
          <div className="top-hero-overlay"></div>
          <div className="hero-progress hero-progress-floating" style={{ "--progress": pageData.summary.achievementRate }}>
            <div className="hero-progress-inner">
              <span className="hero-date">{pageData.summary.date}</span>
              <span className="hero-rate">{pageData.summary.achievementRate}%</span>
            </div>
          </div>
        </div>
        <div className="top-hero-chart">
          <div className="top-hero-chart-header">
            <h2>BODY RECORD</h2>
            <p>
              {pageData.summary.burnedKcal} kcal / {pageData.summary.exerciseMinutes} min
            </p>
          </div>
          <LineChart data={pageData.chartData} />
        </div>
      </section>

      <section className="top-action-strip">
        {pageData.topActions.map((action) => (
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
          {pageData.mealCards.map((meal) => (
            <article className="meal-card" key={meal.id}>
              <img src={meal.image} alt={meal.name ?? meal.timeLabel} />
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
