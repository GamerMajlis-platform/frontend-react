import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Logo } from "../components";

export default function Login() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", formData);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-white">{t("auth.login")}</h1>
          <p className="text-gray-400 mt-2">{t("auth.welcomeBack")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("auth.email")}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("auth.password")}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-gray-300">
              <input type="checkbox" className="mr-2 rounded" />
              {t("auth.rememberMe")}
            </label>
            <a href="#" className="text-cyan-400 hover:text-cyan-300">
              {t("auth.forgotPassword")}
            </a>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="medium"
            className="w-full mt-6"
          >
            {t("auth.login")}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {t("auth.dontHaveAccount")}{" "}
          <a href="#" className="text-cyan-400 hover:text-cyan-300">
            {t("auth.signup")}
          </a>
        </p>
      </div>
    </div>
  );
}
