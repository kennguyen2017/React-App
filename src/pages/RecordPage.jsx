import { useEffect, useState } from "react";
import { LineChart } from "../components/LineChart.jsx";
import { myRecordService } from "../services/myRecordService.js";

function getDefaultDatetimeLocal() {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function buildNextVisibleDatetime(displayDate) {
  if (!displayDate) {
    return getDefaultDatetimeLocal();
  }

  const normalizedDate = displayDate.replace(/\./g, "-");
  const nextDate = new Date(`${normalizedDate}T08:00:00`);

  if (Number.isNaN(nextDate.getTime())) {
    return getDefaultDatetimeLocal();
  }

  nextDate.setDate(nextDate.getDate() + 1);
  return new Date(nextDate.getTime() - nextDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}

function createInitialForm() {
  return {
    userId: "3",
    bodyName: "Body Record",
    recordedAt: getDefaultDatetimeLocal(),
    weight: "68.4",
    bodyFatRate: "18.7",
    bodyImageUrl: "",
    exerciseTitle: "",
    exerciseType: "",
    exerciseCalories: "",
    exercisePerformedAt: getDefaultDatetimeLocal(),
    exerciseImageUrl: "",
    diaryTitle: "",
    diaryContent: "",
    diaryImageUrl: "",
  };
}

function toOptionalText(value) {
  const normalizedValue = value.trim();
  return normalizedValue ? normalizedValue : null;
}

function toIsoString(value) {
  return new Date(value).toISOString();
}

export function RecordPage() {
  const [selectedUserId, setSelectedUserId] = useState(3);
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(() => createInitialForm());

  async function loadRecordPage(userId, signal) {
    try {
      setIsLoading(true);
      const result = await myRecordService.getMyRecord({ userId, signal });
      setPageData(result);
      setFormData((currentFormData) => ({
        ...currentFormData,
        userId: String(userId),
        recordedAt: buildNextVisibleDatetime(result.chartDate),
        exercisePerformedAt: buildNextVisibleDatetime(result.exerciseDate || result.chartDate),
      }));
      setErrorMessage("");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setPageData(null);
      setErrorMessage("Backend My Record API is unavailable. Start the backend before opening this page.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();
    loadRecordPage(selectedUserId, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [selectedUserId]);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleLoadSelectedUser() {
    const nextUserId = Number(formData.userId);
    if (Number.isNaN(nextUserId) || nextUserId <= 0) {
      setErrorMessage("User ID must be greater than 0.");
      return;
    }

    setSelectedUserId(nextUserId);
  }

  async function handleCreateMyRecord(event) {
    event.preventDefault();

    const hasExercise = [
      formData.exerciseTitle,
      formData.exerciseType,
      formData.exerciseCalories,
      formData.exerciseImageUrl,
    ].some((value) => value.trim() !== "");

    const hasDiary = [formData.diaryTitle, formData.diaryContent, formData.diaryImageUrl].some((value) => value.trim() !== "");

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const userId = Number(formData.userId);
      await myRecordService.createMyRecord({
        userId,
        bodyRecord: {
          name: formData.bodyName,
          recordedAt: toIsoString(formData.recordedAt),
          weight: Number(formData.weight),
          bodyFatRate: Number(formData.bodyFatRate),
          imageUrl: toOptionalText(formData.bodyImageUrl),
        },
        exercise: hasExercise
          ? {
              title: formData.exerciseTitle,
              exerciseType: formData.exerciseType,
              calories: Number(formData.exerciseCalories),
              performedAt: toIsoString(formData.exercisePerformedAt),
              imageUrl: toOptionalText(formData.exerciseImageUrl),
            }
          : null,
        diary: hasDiary
          ? {
              title: formData.diaryTitle,
              content: formData.diaryContent,
              imageUrl: toOptionalText(formData.diaryImageUrl),
            }
          : null,
      });

      setSelectedUserId(userId);
      await loadRecordPage(userId);
      setFormData((currentFormData) => ({
        ...createInitialForm(),
        userId: currentFormData.userId,
        recordedAt: currentFormData.recordedAt,
        exercisePerformedAt: currentFormData.exercisePerformedAt,
      }));
      setSuccessMessage("My Record data saved successfully.");
    } catch (error) {
      setErrorMessage(error.message || "Failed to create my record data.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p className="top-page-status">Loading my record data from backend...</p>;
  }

  if (!pageData) {
    return <p className="top-page-status top-page-status-warning">{errorMessage}</p>;
  }

  return (
    <>
      <section className="entry-form-panel">
        <div className="entry-form-header">
          <div>
            <p className="entry-form-kicker">My Record</p>
            <h2>Save a new body record, with optional exercise and diary</h2>
          </div>
          <div className="entry-actions">
            <button className="record-filter-chip" type="button" onClick={handleLoadSelectedUser}>
              Load selected user
            </button>
          </div>
        </div>

        <form className="entry-form-grid" onSubmit={handleCreateMyRecord}>
          <label className="entry-field">
            <span>User ID</span>
            <input className="entry-input" name="userId" type="number" min="1" value={formData.userId} onChange={handleFormChange} />
          </label>

          <label className="entry-field">
            <span>Body name</span>
            <input className="entry-input" name="bodyName" type="text" value={formData.bodyName} onChange={handleFormChange} required />
          </label>

          <label className="entry-field">
            <span>Recorded at</span>
            <input className="entry-input" name="recordedAt" type="datetime-local" value={formData.recordedAt} onChange={handleFormChange} required />
          </label>

          <label className="entry-field">
            <span>Weight (kg)</span>
            <input className="entry-input" name="weight" type="number" min="0.1" step="0.1" value={formData.weight} onChange={handleFormChange} required />
          </label>

          <label className="entry-field">
            <span>Body fat rate (%)</span>
            <input className="entry-input" name="bodyFatRate" type="number" min="0.1" step="0.1" value={formData.bodyFatRate} onChange={handleFormChange} required />
          </label>

          <label className="entry-field entry-field-wide">
            <span>Body image URL</span>
            <input className="entry-input" name="bodyImageUrl" type="url" value={formData.bodyImageUrl} onChange={handleFormChange} placeholder="https://..." />
          </label>

          <section className="entry-form-section entry-field-full">
            <div className="entry-form-section-header">
              <h3>Optional exercise</h3>
              <p>Fill this block only if you want an exercise row created together with the body record.</p>
            </div>
            <div className="entry-form-grid">
              <label className="entry-field">
                <span>Exercise title</span>
                <input className="entry-input" name="exerciseTitle" type="text" value={formData.exerciseTitle} onChange={handleFormChange} />
              </label>

              <label className="entry-field">
                <span>Duration label</span>
                <input className="entry-input" name="exerciseType" type="text" value={formData.exerciseType} onChange={handleFormChange} placeholder="20 min" />
              </label>

              <label className="entry-field">
                <span>Calories</span>
                <input className="entry-input" name="exerciseCalories" type="number" min="1" step="1" value={formData.exerciseCalories} onChange={handleFormChange} />
              </label>

              <label className="entry-field">
                <span>Performed at</span>
                <input className="entry-input" name="exercisePerformedAt" type="datetime-local" value={formData.exercisePerformedAt} onChange={handleFormChange} />
              </label>

              <label className="entry-field entry-field-wide">
                <span>Exercise image URL</span>
                <input className="entry-input" name="exerciseImageUrl" type="url" value={formData.exerciseImageUrl} onChange={handleFormChange} placeholder="https://..." />
              </label>
            </div>
          </section>

          <section className="entry-form-section entry-field-full">
            <div className="entry-form-section-header">
              <h3>Optional diary</h3>
              <p>Diary content is stored in the `diaries` table and shows up in the MY DIARY grid after reload.</p>
            </div>
            <div className="entry-form-grid">
              <label className="entry-field">
                <span>Diary title</span>
                <input className="entry-input" name="diaryTitle" type="text" value={formData.diaryTitle} onChange={handleFormChange} />
              </label>

              <label className="entry-field entry-field-wide">
                <span>Diary image URL</span>
                <input className="entry-input" name="diaryImageUrl" type="url" value={formData.diaryImageUrl} onChange={handleFormChange} placeholder="https://..." />
              </label>

              <label className="entry-field entry-field-full">
                <span>Diary content</span>
                <textarea className="entry-textarea" name="diaryContent" rows="5" value={formData.diaryContent} onChange={handleFormChange} />
              </label>
            </div>
          </section>

          <div className="entry-actions entry-field-full">
            <button className="column-load-more" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save My Record"}
            </button>
          </div>
        </form>

        {successMessage ? <p className="entry-feedback entry-feedback-success">{successMessage}</p> : null}
        {errorMessage ? <p className="entry-feedback entry-feedback-error">{errorMessage}</p> : null}
      </section>

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
