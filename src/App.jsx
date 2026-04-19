import { useEffect, useMemo, useState } from "react";
import { AuthPage } from "./pages/AuthPage.jsx";
import { Layout } from "./components/Layout.jsx";
import { ColumnPage } from "./pages/ColumnPage.jsx";
import { RecordPage } from "./pages/RecordPage.jsx";
import { memberAuthService } from "./services/memberAuthService.js";
import { TopPage } from "./pages/TopPage.jsx";

function normalizeRoute(hashValue) {
  if (hashValue === "#/my-record" || hashValue === "#/column" || hashValue === "#/top") {
    return hashValue;
  }
  return "#/top";
}

export function App() {
  const [memberSession, setMemberSession] = useState(() => memberAuthService.readSession());
  const [route, setRoute] = useState(() => normalizeRoute(window.location.hash));

  useEffect(() => {
    if (!memberSession) {
      return undefined;
    }

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
  }, [memberSession]);

  function handleAuthenticated(member) {
    const nextSession = { member };
    setMemberSession(nextSession);
    window.location.hash = "#/top";
  }

  function handleLogout() {
    memberAuthService.clearSession();
    setMemberSession(null);
  }

  if (!memberSession) {
    return <AuthPage onAuthenticated={handleAuthenticated} />;
  }

  const content = useMemo(() => {
    if (route === "#/my-record") {
      return <RecordPage />;
    }

    if (route === "#/column") {
      return <ColumnPage />;
    }

    return <TopPage />;
  }, [route]);

  return <Layout activeRoute={route} currentMember={memberSession.member} onLogout={handleLogout}>{content}</Layout>;
}
