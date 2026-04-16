const navItems = [
  { label: "Top", route: "#/top" },
  { label: "My Record", route: "#/my-record" },
  { label: "Column", route: "#/column" },
];

export function Layout({ activeRoute, children }) {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">HEALTH / DASH</div>
        <nav className="main-nav">
          {navItems.map((item) => (
            <a
              key={item.route}
              className={`nav-link ${activeRoute === item.route ? "is-active" : ""}`}
              href={item.route}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="page-content">{children}</main>
    </div>
  );
}
