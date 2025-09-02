import { useTranslation } from "react-i18next";

export default function Messages() {
  const { t } = useTranslation();

  return (
    <div className="w-full min-h-screen bg-slate-900 py-12">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-white mb-8">
          {t("pages.messages")}
        </h1>
        <div className="bg-slate-800 rounded-lg p-8">
          <p className="text-gray-300">
            {t("pages.comingSoon", { page: t("pages.messages") })}
          </p>
        </div>
      </div>
    </div>
  );
}
