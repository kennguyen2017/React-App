import { renderLayout } from "./components/layout.js";
import { renderColumnPage } from "./pages/columnPage.js";
import { renderRecordPage } from "./pages/recordPage.js";
import { renderTopPage } from "./pages/topPage.js";
import { getCurrentRoute, onRouteChange } from "./router.js";

function renderRoute(route) {
  switch (route) {
    case "#/my-record":
      return renderRecordPage();
    case "#/column":
      return renderColumnPage();
    case "#/top":
    default:
      return renderTopPage();
  }
}

export function createApp(rootElement) {
  const render = () => {
    const currentRoute = getCurrentRoute();
    const pageHtml = renderRoute(currentRoute);
    rootElement.innerHTML = renderLayout(currentRoute, pageHtml);
  };

  onRouteChange(render);
  render();
}
