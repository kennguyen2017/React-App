import { useEffect, useState } from "react";
import { columnService } from "../services/columnService.js";

const INITIAL_VISIBLE_COUNT = 8;

export function ColumnPage() {
  const [pageData, setPageData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const abortController = new AbortController();

    async function loadInitialColumns() {
      try {
        setIsLoading(true);
        const result = await columnService.getColumns({
          limit: INITIAL_VISIBLE_COUNT,
          offset: 0,
          signal: abortController.signal,
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
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    loadInitialColumns();

    return () => {
      abortController.abort();
    };
  }, []);

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

  if (!pageData) {
    return <p className="top-page-status top-page-status-warning">{errorMessage}</p>;
  }

  const canLoadMore = pageData.pagination?.hasMore ?? false;

  return (
    <>
      <section className="column-tab-grid">
        {pageData.tabs.map((tab) => (
          <article className="column-tab-card" key={tab.id}>
            <h2>{tab.title}</h2>
            <span>{tab.subtitle}</span>
          </article>
        ))}
      </section>

      <section className="column-article-grid">
        {pageData.articles.map((article) => (
          <article className="column-article-card" key={`${article.date}-${article.title}`}>
            <img src={article.image} alt={article.title} />
            <div className="column-article-date">{article.date}</div>
            <h3>{article.title}</h3>
            <p>{article.tags.join(" ")}</p>
          </article>
        ))}
      </section>

      {canLoadMore ? (
        <button className="column-load-more" type="button" onClick={handleLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? "読み込み中..." : "コラムをもっと見る"}
        </button>
      ) : null}

      {errorMessage ? <p className="top-page-status top-page-status-warning">{errorMessage}</p> : null}
    </>
  );
}
