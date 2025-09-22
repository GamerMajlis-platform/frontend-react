import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function MessagesPage() {
  const { t } = useTranslation();

  useEffect(() => {
    // Auto-redirect to chat system after a brief message
    const timer = setTimeout(() => {
      window.location.hash = "/chat";
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-6">💬</div>
        <h1 className="text-2xl font-bold mb-4">
          {t("messages.redirecting", "Messages System Updated")}
        </h1>
        <p className="text-gray-600 mb-6">
          {t(
            "messages.redirectDescription",
            "The messaging system has been upgraded to a comprehensive chat system with rooms, direct messages, and real-time features."
          )}
        </p>
        <p className="text-sm text-gray-500">
          {t("messages.autoRedirect", "Redirecting to the new chat system...")}
        </p>
        <div className="mt-6">
          <a
            href="#/chat"
            className="inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
          >
            {t("messages.goToChat", "Go to Chat Now")}
          </a>
        </div>
      </div>
    </main>
  );
}
