import { useEffect, useState } from "react";
import { LineChart } from "../components/LineChart.jsx";
import { myRecordService } from "../services/myRecordService.js";

export function RecordPage() {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadMyRecord() {
      try {
        setIsLoading(true);
        const result = await myRecordService.getMyRecord({ signal: abortController.signal });
        setPageData(result);
        setErrorMessage("");
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }

        setPageData(null);
        setErrorMessage("Backend My Record API is unavailable. Start the backend before opening this page.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadMyRecord();

    return () => {
      abortController.abort();
    };
  }, []);

  if (isLoading) {
    return <p className="top-page-status">Loading my record data from backend...</p>;
  }

  if (!pageData) {
    return <p className="top-page-status top-page-status-warning">{errorMessage}</p>;
  }

  return (
    <>
      <section className="record-highlight-grid">
        {pageData.highlights.map((item) => (
          <article className="record-highlight-card" key={item.id}>
            <img src={item.image} alt={item.title} />
            <div className="record-highlight-overlay"></div>
            <div className="record-highlight-frame"></div>
            <div className="record-highlight-content">
              <h2>{item.title}</h2>
              <p>{item.subtitle}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="record-chart-panel">
        <div className="record-panel-header">
          <h2>MY RECORD</h2>
          <span>{pageData.chartDate}</span>
        </div>
        <LineChart data={pageData.chartData} height={360} />
        <div className="record-filter-row">
          {pageData.chartFilters.map((filter) => (
            <button className="record-filter-chip" key={filter.id} type="button">
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <section className="exercise-panel">
        <div className="record-panel-header">
          <h2>MY EXERCISE</h2>
          <span>{pageData.exerciseDate}</span>
        </div>
        <div className="exercise-log-grid">
          {pageData.exerciseItems.map((exercise) => (
            <article className="exercise-log-item" key={`${exercise.name}-${exercise.duration}`}>
              <div>
                <h3>{exercise.name}</h3>
                <p>{exercise.kcal}kcal</p>
              </div>
              <span>{exercise.duration}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="diary-panel">
        <div className="diary-panel-heading">MY DIARY</div>
        <div className="diary-grid">
          {pageData.diaryEntries.map((entry) => (
            <article className="diary-card" key={`${entry.date}-${entry.time}`}>
              <div className="diary-card-date">{entry.date}</div>
              <div className="diary-card-time">{entry.time}</div>
              <p>{entry.content}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
