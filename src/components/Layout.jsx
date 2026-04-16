const navItems = [
  { label: "自分の記録", route: "#/my-record", iconClass: "is-record" },
  { label: "チャレンジ", route: "#/top", iconClass: "is-challenge" },
  { label: "コラム", route: "#/column", iconClass: "is-column" },
];

export function Layout({ activeRoute, children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#/top" aria-label="Healthy home">
          <span className="brand-word">Healthy</span>
          <span className="brand-accent"></span>
        </a>

        <nav className="main-nav">
          {navItems.map((item) => (
            <a
              key={item.route}
              className={`nav-link ${activeRoute === item.route ? "is-active" : ""}`}
              href={item.route}
            >
              <span className={`nav-icon ${item.iconClass}`} aria-hidden="true"></span>
              <span className="nav-label">{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="header-tools">
          <button className="header-tool notice-tool" type="button" aria-label="Notifications">
            <span className="nav-icon is-notice" aria-hidden="true"></span>
            <span className="nav-label">お知らせ</span>
            <span className="notice-badge">1</span>
          </button>
          <button className="header-tool menu-tool" type="button" aria-label="Menu">
            <span className="menu-lines" aria-hidden="true">
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
