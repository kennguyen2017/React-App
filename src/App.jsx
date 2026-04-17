import { useEffect, useMemo, useState } from "react";
import { AuthPage } from "./pages/AuthPage.jsx";
import { Layout } from "./components/Layout.jsx";
import { ColumnPage } from "./pages/ColumnPage.jsx";
import { RecordPage } from "./pages/RecordPage.jsx";
import { TopPage } from "./pages/TopPage.jsx";

function normalizeRoute(hashValue) {
  if (hashValue === "#/my-record" || hashValue === "#/column" || hashValue === "#/top" || hashValue === "#/auth") {
    return hashValue;
  }
  return "#/top";
}

export function App() {
  const [route, setRoute] = useState(() => normalizeRoute(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setRoute(normalizeRoute(window.location.hash));
    };

    window.addEventListener("hashchange", onHashChange);
    if (!window.location.hash) {
      window.location.hash = "#/top";
    }

    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  const content = useMemo(() => {
    if (route === "#/my-record") {
      return <RecordPage />;
    }

    if (route === "#/column") {
      return <ColumnPage />;
    }

    if (route === "#/auth") {
      return <AuthPage />;
    }

    return <TopPage />;
  }, [route]);

  return <Layout activeRoute={route}>{content}</Layout>;
}
