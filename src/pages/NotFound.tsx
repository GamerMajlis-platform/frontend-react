import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-20 text-white">
      <h1 className="text-6xl font-bold mb-6">404</h1>
      <p className="text-xl mb-8 max-w-md opacity-80">
        The page you were looking for could not be found.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-lg bg-primary text-slate-900 font-semibold shadow-glow hover:brightness-110 transition"
      >
        Return Home
      </Link>
    </main>
  );
}
