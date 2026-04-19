const navItems = [
  { label: "自分の記録", route: "#/my-record", iconClass: "is-record" },
  { label: "チャレンジ", route: "#/top", iconClass: "is-challenge" },
  { label: "コラム", route: "#/column", iconClass: "is-column" },
];

const footerLinks = [
  { label: "トップページ", href: "#/top" },
  { label: "運営会社", href: "#/top" },
  { label: "利用規約", href: "#/top" },
  { label: "個人情報の取扱について", href: "#/top" },
  { label: "特定商取引法に基づく表記", href: "#/top" },
  { label: "お問い合わせ", href: "#/top" },
];

export function Layout({ activeRoute, currentMember, children, onLogout }) {
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
          <div className="header-member-chip">{currentMember?.fullName ?? "Member"}</div>
          <button className="header-tool notice-tool" type="button" aria-label="Notifications">
            <span className="nav-icon is-notice" aria-hidden="true"></span>
            <span className="nav-label">お知らせ</span>
            <span className="notice-badge">1</span>
          </button>
          <button className="header-tool logout-tool" type="button" onClick={onLogout}>
            <span className="nav-label">ログアウト</span>
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
      <footer className="app-footer">
        <nav className="footer-nav" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a className="footer-link" href={link.href} key={link.label}>
              {link.label}
            </a>
          ))}
        </nav>
      </footer>
    </div>
  );
}
