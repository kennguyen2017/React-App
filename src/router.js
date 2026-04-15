const routes = {
  "#/top": "top",
  "#/my-record": "my-record",
  "#/column": "column",
};

export function getCurrentRoute() {
  const hash = window.location.hash || "#/top";
  return routes[hash] ? hash : "#/top";
}

export function navigateTo(route) {
  if (routes[route]) {
    window.location.hash = route;
  }
}

export function onRouteChange(callback) {
  window.addEventListener("hashchange", callback);
}
