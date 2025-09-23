import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { STORAGE_KEYS } from "../config/constants";
import { useAppContext } from "../context/useAppContext";

/**
 * AuthSuccess page
 * Handles backend redirect style: /auth/success?token=...&return=...
 * Stores token then redirects to desired return (default /)
 */
export default function AuthSuccess() {
  const navigate = useNavigate();
  const { refreshProfile } = useAppContext();
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      const ret = params.get("return") || "/";
      if (token) {
        localStorage.setItem(STORAGE_KEYS.auth, token);
        refreshProfile().finally(() => {
          // Clean navigation with state preservation
          navigate(ret, { replace: true, state: { fromAuth: true } });
        });
      } else {
        navigate("/login", { replace: true });
      }
    } catch {
      navigate("/login", { replace: true });
    }
  }, [refreshProfile, navigate]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center space-y-4">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm opacity-70">Finalizing authentication…</p>
      </div>
    </div>
  );
}
