import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Minimal loading page to avoid large redirect content.
export default function MessagesPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/chat"), 300);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <main className="min-h-screen p-6 flex items-center justify-center">
      <div className="text-center text-lg text-gray-200">Loading...</div>
    </main>
  );
}
