import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DiscordService } from "../services/DiscordService";
import { SessionService } from "../services/SessionService";

const DiscordCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"processing" | "error" | "success">(
    "processing"
  );
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const state = params.get("state");
        const tokenParam = params.get("token");
        const error = params.get("error");
        const success = params.get("success");

        console.log("🔍 Discord Callback Parameters:", {
          code,
          state,
          error,
          success,
          fullUrl: window.location.href,
        });

        // If backend returned a token directly in the URL (some backends do
        // this after successful exchange), store it and redirect.
        if (tokenParam) {
          SessionService.storeToken(tokenParam);
          setStatus("success");
          navigate("/", { replace: true, state: { fromOAuth: true } });
          return;
        }

        // If there's an error from the backend
        if (error) {
          throw new Error(`OAuth failed: ${error}`);
        }

        // If success=false from backend
        if (success === "false") {
          throw new Error("Authentication was not successful");
        }

        if (!code || !state) {
          throw new Error("Missing OAuth parameters: code or state not found");
        }

        const stored = DiscordService.getStoredOAuthState();
        const returnUrl = stored?.returnUrl || "/";

        console.log("🔄 Processing OAuth callback...");
        const res = await DiscordService.handleOAuthCallback(code, state);

        if (res && res.success && res.token) {
          SessionService.storeToken(res.token);
          setStatus("success");
          // Use replace to prevent back button issues and maintain state
          navigate(returnUrl, { replace: true, state: { fromOAuth: true } });
          return;
        }

        throw new Error("Authentication response was invalid");
      } catch (error) {
        // Surface detailed error information for debugging
        console.error("Discord callback error:", error);
        setStatus("error");

        // Try to extract a useful message from ApiError-like objects
        let message = "Authentication failed";
        try {
          // ApiError from ErrorHandler has message + errorCode + statusCode
          if (error && typeof error === "object") {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const e: any = error as any;
            if (e.message) message = e.message;
            if (e.errorCode) message += ` (code: ${e.errorCode})`;
            if (e.statusCode) message += ` [status: ${e.statusCode}]`;
            if (e.errors) message += ` details: ${JSON.stringify(e.errors)}`;
          }
        } catch {
          // ignore extraction errors
        }

        setErrorMessage(message);
      }
    })();
  }, [navigate]);

  if (status === "processing") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Processing Discord login...</div>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
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
          <div className="text-gray-800 font-medium mb-2">
            Authentication Successful!
          </div>
          <div className="text-gray-600">
            Redirecting you back to the application...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
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
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Authentication Failed
          </h2>
          <p className="text-gray-600 mb-4">{errorMessage}</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate("/login", { replace: true })}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Back to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscordCallback;
