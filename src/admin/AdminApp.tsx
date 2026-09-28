import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  AdminSession,
  adminLogout,
  getValidSession,
  isAdmin,
  loadSession,
} from "./adminApi";
import { AdminLogin } from "./Adminlogin";
import { AdminDashboard } from "./AdminDashboard";

const AdminApp: React.FC = () => {
  // undefined = still checking a saved session, null = signed out
  const [session, setSession] = useState<AdminSession | null | undefined>(
    undefined,
  );
  const [notice, setNotice] = useState("");

  // Keep the admin page out of search engines.
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Admin — The Indian Edit";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex,nofollow";
    document.head.appendChild(meta);
    return () => {
      document.title = prevTitle;
      meta.remove();
    };
  }, []);

  // Restore a saved session (and re-verify admin access) on load.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getValidSession();
        if (!s) return !cancelled && setSession(null);
        if (await isAdmin(s)) {
          if (!cancelled) setSession(s);
        } else {
          await adminLogout(s);
          if (!cancelled) setSession(null);
        }
      } catch (err) {
        if (!cancelled) {
          setNotice(err instanceof Error ? err.message : "");
          setSession(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async (message = "") => {
    await adminLogout(loadSession());
    setNotice(message);
    setSession(null);
  };

  if (session === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070403] text-[#d4af37]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLoggedIn={setSession} initialError={notice} />;
  }

  return <AdminDashboard session={session} onSignOut={signOut} />;
};

export default AdminApp;
