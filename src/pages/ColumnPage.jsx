import { useState } from "react";
import { articleTabs, columnArticles } from "../data/columnData.js";

const INITIAL_VISIBLE_COUNT = 8;

export function ColumnPage() {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const visibleArticles = columnArticles.slice(0, visibleCount);
  const canLoadMore = visibleCount < columnArticles.length;

  return (
    <>
      <section className="column-tab-grid">
        {articleTabs.map((tab) => (
          <article className="column-tab-card" key={tab.id}>
            <h2>{tab.title}</h2>
            <span>{tab.subtitle}</span>
          </article>
        ))}
      </section>

      <section className="column-article-grid">
        {visibleArticles.map((article) => (
          <article className="column-article-card" key={`${article.date}-${article.title}`}>
            <img src={article.image} alt={article.title} />
            <div className="column-article-date">{article.date}</div>
            <h3>{article.title}</h3>
            <p>{article.tags.join(" ")}</p>
          </article>
        ))}
      </section>

      {canLoadMore ? (
        <button
          className="column-load-more"
          type="button"
          onClick={() => setVisibleCount((currentCount) => currentCount + INITIAL_VISIBLE_COUNT)}
        >
          コラムをもっと見る
        </button>
      ) : null}
    </>
  );
}
