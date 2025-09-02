import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Logo } from "../components";

export default function Signup() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle signup logic here
    console.log("Signup:", formData);
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-slate-800 rounded-lg p-8">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" />
          <h1 className="text-2xl font-bold text-white">{t("auth.signup")}</h1>
          <p className="text-gray-400 mt-2">{t("auth.joinCommunity")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("auth.username")}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

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

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              {t("auth.confirmPassword")}
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-hidden focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="medium"
            className="w-full mt-6"
          >
            {t("auth.signup")}
          </Button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {t("auth.alreadyHaveAccount")}{" "}
          <a href="#" className="text-cyan-400 hover:text-cyan-300">
            {t("auth.login")}
          </a>
        </p>
      </div>
    </div>
  );
}
