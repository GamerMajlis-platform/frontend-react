import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";

interface OnlineStatusProps {
  isOnline?: boolean;
  lastSeen?: string | null;
  show?: boolean; // component-level override
  className?: string;
}

export default function OnlineStatus({
  isOnline,
  lastSeen,
  show = true,
  className = "",
}: OnlineStatusProps) {
  const { t } = useTranslation();
  const { settings } = useAppContext();

  // Respect global viewer setting for showing online status
  const viewerAllowsOnline =
    settings?.privacy?.showOnlineStatus === undefined
      ? true
      : Boolean(settings.privacy.showOnlineStatus);

  if (!show || !viewerAllowsOnline) return null;

  if (isOnline) {
    return (
      <div className={`inline-flex items-center text-green-400 ${className}`}>
        <span className="w-2 h-2 bg-green-400 rounded-full mr-2" />
        <span className="text-sm">{t("profile:status.online", "Online")}</span>
      </div>
    );
  }

  // Show last seen when offline if available
  if (lastSeen) {
    // lastSeen is expected ISO string
    const date = new Date(lastSeen);
    const formatted = date.toLocaleString();
    return (
      <div className={`inline-flex items-center text-slate-400 ${className}`}>
        <span className="w-2 h-2 bg-slate-500 rounded-full mr-2" />
        <span className="text-sm">
          {t("profile:status.last_seen", { when: formatted })}
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center text-slate-400 ${className}`}>
      <span className="w-2 h-2 bg-slate-500 rounded-full mr-2" />
      <span className="text-sm">{t("profile:status.offline", "Offline")}</span>
    </div>
  );
}
