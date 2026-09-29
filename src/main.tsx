import { StrictMode, Suspense, lazy, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Admin panel is code-split so players never download it.
const AdminApp = lazy(() => import("./admin/AdminApp"));

// Works both as /admin (needs an SPA fallback on the host) and /#/admin
// (works on any static host with no server config).
const isAdminRoute = () =>
  /^\/admin(\/|$)/.test(window.location.pathname) ||
  /^#\/admin(\/|$)/.test(window.location.hash);

function Root() {
  const [admin, setAdmin] = useState(isAdminRoute());

  useEffect(() => {
    const onChange = () => setAdmin(isAdminRoute());
    window.addEventListener("hashchange", onChange);
    window.addEventListener("popstate", onChange);
    return () => {
      window.removeEventListener("hashchange", onChange);
      window.removeEventListener("popstate", onChange);
    };
  }, []);

  if (!admin) return <App />;
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#070403]" />}>
      <AdminApp />
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
