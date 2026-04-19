import { useEffect, useState } from "react";
import { columnService } from "../services/columnService.js";

const INITIAL_VISIBLE_COUNT = 8;

function createInitialColumnForm() {
  return {
    userId: "3",
    title: "",
    imageUrl: "",
    content: "",
  };
}

export function ColumnPage() {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState(() => createInitialColumnForm());

  async function loadInitialColumns(signal) {
    try {
      setIsLoading(true);
      const result = await columnService.getColumns({
        limit: INITIAL_VISIBLE_COUNT,
        offset: 0,
        signal,
      });
      setPageData(result);
      setErrorMessage("");
    } catch (error) {
      if (error.name === "AbortError") {
        return;
      }

      setPageData(null);
      setErrorMessage("Backend Column API is unavailable. Start the backend before opening this page.");
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const abortController = new AbortController();

    loadInitialColumns(abortController.signal);

    return () => {
      abortController.abort();
    };
  }, []);

  function handleFormChange(event) {
    const { name, value } = event.target;
    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  }

  async function handleCreateColumn(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");
      const article = await columnService.createColumn(formData);
      await loadInitialColumns();
      setFormData(createInitialColumnForm());
      setIsCreateModalOpen(false);
      setSuccessMessage(`Created column: ${article.title}`);
    } catch (error) {
      setErrorMessage(error.message || "Failed to create column.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLoadMore() {
    if (!pageData?.pagination?.hasMore || isLoadingMore) {
      return;
    }

    try {
      setIsLoadingMore(true);
      const nextPage = await columnService.getColumns({
        limit: INITIAL_VISIBLE_COUNT,
        offset: pageData.articles.length,
      });

      setPageData((currentPageData) => {
        if (!currentPageData) {
          return nextPage;
        }

        return {
          ...nextPage,
          tabs: nextPage.tabs.length > 0 ? nextPage.tabs : currentPageData.tabs,
          articles: [...currentPageData.articles, ...nextPage.articles],
        };
      });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Failed to load more column data from backend.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  if (isLoading) {
    return <p className="top-page-status">Loading column data from backend...</p>;
  }

  const canLoadMore = pageData.pagination?.hasMore ?? false;

  return (
    <>
      <section className="page-action-bar">
        <div>
          <p className="entry-form-kicker">Column Editor</p>
          <h2 className="page-action-title">Health columns</h2>
        </div>
        <button className="column-load-more" type="button" onClick={() => setIsCreateModalOpen(true)}>
          New Column
        </button>
      </section>

      {successMessage ? <p className="entry-feedback entry-feedback-success">{successMessage}</p> : null}
      {errorMessage ? <p className="entry-feedback entry-feedback-error">{errorMessage}</p> : null}

      {isCreateModalOpen ? (
        <div className="entry-modal-overlay" onClick={() => setIsCreateModalOpen(false)} role="presentation">
          <section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="create-column-title" onClick={(event) => event.stopPropagation()}>
            <div className="entry-form-panel entry-modal-panel">
              <div className="entry-form-header">
                <div>
                  <p className="entry-form-kicker">Column Editor</p>
                  <h2 id="create-column-title">Create a new health column</h2>
                </div>
                <div className="entry-modal-actions">
                  <p className="entry-inline-note">A successful submit is inserted into the backend columns table immediately.</p>
                  <button className="entry-modal-close" type="button" onClick={() => setIsCreateModalOpen(false)} aria-label="Close create column form">
                    Close
                  </button>
                </div>
              </div>

              <form className="entry-form-grid" onSubmit={handleCreateColumn}>
                <label className="entry-field">
                  <span>User ID</span>
                  <input className="entry-input" name="userId" type="number" min="1" value={formData.userId} onChange={handleFormChange} />
                </label>

                <label className="entry-field">
                  <span>Title</span>
                  <input className="entry-input" name="title" type="text" value={formData.title} onChange={handleFormChange} required />
                </label>

                <label className="entry-field entry-field-wide">
                  <span>Image URL</span>
                  <input className="entry-input" name="imageUrl" type="url" value={formData.imageUrl} onChange={handleFormChange} placeholder="https://..." />
                </label>

                <label className="entry-field entry-field-full">
                  <span>Content</span>
                  <textarea className="entry-textarea" name="content" value={formData.content} onChange={handleFormChange} rows="6" required />
                </label>

                <div className="entry-actions entry-field-full">
                  <button className="column-load-more" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Create Column"}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      ) : null}

      {!pageData ? <p className="top-page-status top-page-status-warning">{errorMessage}</p> : null}

      <section className="column-tab-grid">
        {pageData?.tabs.map((tab) => (
          <article className="column-tab-card" key={tab.id}>
            <h2>{tab.title}</h2>
            <span>{tab.subtitle}</span>
          </article>
        ))}
      </section>

      <section className="column-article-grid">
        {pageData?.articles.map((article) => (
          <article className="column-article-card" key={`${article.date}-${article.title}`}>
            <img src={article.image} alt={article.title} />
            <div className="column-article-date">{article.date}</div>
            <h3>{article.title}</h3>
            <p>{article.tags.join(" ")}</p>
          </article>
        ))}
      </section>

      {pageData && canLoadMore ? (
        <button className="column-load-more" type="button" onClick={handleLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? "読み込み中..." : "コラムをもっと見る"}
        </button>
      ) : null}
    </>
  );
}
