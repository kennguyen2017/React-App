import { LineChart } from "../components/LineChart.jsx";
import { chartData } from "../data/topData.js";
import {
  diaryEntries,
  exerciseItems,
  recordChartFilters,
  recordHighlights,
} from "../data/recordData.js";

export function RecordPage() {
  return (
    <>
      <section className="record-highlight-grid">
        {recordHighlights.map((item) => (
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
          <span>2026.05.21</span>
        </div>
        <LineChart data={chartData} height={360} />
        <div className="record-filter-row">
          {recordChartFilters.map((filter) => (
            <button className="record-filter-chip" key={filter} type="button">
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="exercise-panel">
        <div className="record-panel-header">
          <h2>MY EXERCISE</h2>
          <span>2026.05.21</span>
        </div>
        <div className="exercise-log-grid">
          {exerciseItems.map((exercise) => (
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
          {diaryEntries.map((entry) => (
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
