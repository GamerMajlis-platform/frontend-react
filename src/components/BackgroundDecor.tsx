import Logo from "./Logo";

/**
 * BackgroundDecor renders the decorative shapes and floating controller
 * used on the Home page so they can be reused across other pages.
 * Place this inside a relatively positioned container.
 */
export default function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      {/* Decorative shapes (hidden on small screens for cleanliness) */}
      <div className="hidden md:block absolute top-24 left-16 w-16 h-16 lg:w-20 lg:h-20 border-2 lg:border-4 border-[#5BC0BE] rotate-45 opacity-60" />
      <div className="hidden md:block absolute top-40 right-24 w-20 h-20 lg:w-24 lg:h-24 border-2 lg:border-4 border-[#5BC0BE] rounded-full opacity-60" />
      <div className="hidden md:block absolute bottom-32 right-16 w-12 h-12 lg:w-16 lg:h-16 border-2 lg:border-4 border-[#5BC0BE] rotate-45 opacity-60" />
      <div className="hidden lg:block absolute bottom-48 left-20 w-6 h-6 bg-[#6FFFE9] rounded-full opacity-40" />
      <div className="hidden lg:block absolute top-1/3 left-1/4 w-2 h-2 bg-[#6FFFE9] rounded-full opacity-60" />
      <div className="hidden lg:block absolute top-2/3 right-1/3 w-3 h-3 bg-[#6FFFE9] rounded-full opacity-50" />

      {/* Floating controller icon (bottom-left) */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8">
        <Logo size="large" showText={false} />
      </div>
    </div>
  );
}
