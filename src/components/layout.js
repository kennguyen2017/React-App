const navItems = [
  { label: "Top", route: "#/top" },
  { label: "My Record", route: "#/my-record" },
  { label: "Column", route: "#/column" },
];

export function renderLayout(activeRoute, pageHtml) {
  return `
    <div class="app-shell">
      <header class="app-header">
        <div class="brand">HEALTH / DASH</div>
        <nav class="main-nav">
          ${navItems
            .map(
              (item) =>
                `<a class="nav-link ${activeRoute === item.route ? "is-active" : ""}" href="${item.route}">${item.label}</a>`
            )
            .join("")}
        </nav>
      </header>
      <main class="page-content">${pageHtml}</main>
    </div>
  `;
}
