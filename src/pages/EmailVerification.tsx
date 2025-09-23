import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function EmailVerification() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get("token");

        if (!token) {
          setStatus("error");
          setMessage("No verification token provided");
          return;
        }

        // Call the verification endpoint
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8080/api"
          }/auth/verify-email?token=${token}`
        );
        const data = await response.json();

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully!");

          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate("/login");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Email verification failed");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred during verification");
        console.error("Email verification error:", error);
      }
    };

    verifyEmail();
  }, [navigate]);

  return (
    <div className="w-full min-h-screen bg-[#0B132B] flex items-center justify-center relative px-4 sm:px-6">
      <div className="relative w-full max-w-[500px] sm:max-w-[600px] lg:max-w-[802px] min-h-[400px] bg-[rgba(11,19,43,0.95)] shadow-[0_8px_30px_rgba(2,8,23,0.6)] rounded-xl px-6 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-12 sm:pb-[72px] flex flex-col items-center justify-center box-border backdrop-blur-[6px]">
        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C4FFF9] mx-auto mb-4"></div>
            <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] mb-4">
              {t("auth.verifyingEmail")}
            </h1>
            <p className="text-[#9CA3AF] text-center">{t("auth.pleaseWait")}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] mb-4">
              {t("auth.emailVerified")}
            </h1>
            <p className="text-[#9CA3AF] text-center mb-6">{message}</p>
            <p className="text-[#C4FFF9] text-sm text-center">
              {t("auth.redirectingToLogin")}
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="font-[Alice] font-normal text-[24px] sm:text-[28px] lg:text-[32px] leading-tight text-center text-[#EEEEEE] mb-4">
              {t("auth.verificationFailed")}
            </h1>
            <p className="text-[#9CA3AF] text-center mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-[#C4FFF9] text-[#0B132B] rounded-lg font-semibold hover:bg-[#CFFFEF] transition-colors"
            >
              {t("auth.backToLogin")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
