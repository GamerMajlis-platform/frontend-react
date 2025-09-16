import Logo from "./Logo";
import { memo } from "react";

/**
 * BackgroundDecor renders beautiful animated decorative elements and patterns
 * used throughout the application for visual enhancement.
 * Place this inside a relatively positioned container.
 */
function BackgroundDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {/* Animated gradient orbs - Large background elements */}
      <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-gradient-to-br from-tiffany-blue/10 to-aquamarine/20 rounded-full blur-3xl animate-pulse opacity-60" />
      <div className="absolute bottom-1/3 right-1/6 w-80 h-80 bg-gradient-to-tl from-persian-green/15 to-turquoise/25 rounded-full blur-3xl animate-pulse opacity-50 animate-delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-medium-turquoise/10 to-powder-blue/20 rounded-full blur-3xl animate-pulse opacity-40 animate-delay-2000" />

      {/* Geometric pattern grid */}
      <div className="absolute inset-0 opacity-20">
        {/* Diagonal grid lines */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent via-aquamarine/5 to-transparent bg-[length:100px_100px] transform rotate-12" />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tl from-transparent via-tiffany-blue/5 to-transparent bg-[length:80px_80px] transform -rotate-12" />
      </div>

      {/* Floating geometric shapes with enhanced animations */}
      {/* Top section */}
      <div className="hidden sm:block absolute top-20 left-20 w-8 h-8 md:w-12 md:h-12 lg:w-16 lg:h-16 border-2 border-tiffany-blue/60 rotate-45 animate-spin-slow opacity-70" />
      <div className="hidden md:block absolute top-32 right-32 w-10 h-10 lg:w-14 lg:h-14 border-2 border-aquamarine/50 rounded-full animate-bounce opacity-60" />
      <div className="hidden lg:block absolute top-16 left-1/2 w-6 h-6 border border-turquoise/60 rotate-45 animate-pulse opacity-50" />

      {/* Middle section */}
      <div className="hidden md:block absolute top-1/2 left-16 w-4 h-20 md:w-6 md:h-24 bg-gradient-to-b from-persian-green/40 to-transparent rounded-full animate-sway opacity-50" />
      <div className="hidden lg:block absolute top-1/2 right-20 w-20 h-4 bg-gradient-to-r from-transparent via-medium-turquoise/40 to-transparent rounded-full animate-sway-horizontal opacity-50" />
      <div className="hidden sm:block absolute top-1/3 right-1/4 w-2 h-2 md:w-3 md:h-3 bg-aquamarine/80 rounded-full animate-twinkle opacity-70" />
      <div className="hidden sm:block absolute top-2/3 left-1/3 w-2 h-2 md:w-3 md:h-3 bg-light-cyan/80 rounded-full animate-twinkle animate-delay-500 opacity-70" />

      {/* Bottom section */}
      <div className="hidden md:block absolute bottom-40 right-24 w-10 h-10 lg:w-14 lg:h-14 border-2 border-powder-blue/50 rotate-45 animate-spin-slow opacity-60" />
      <div className="hidden sm:block absolute bottom-32 left-32 w-6 h-6 md:w-8 md:h-8 border border-turquoise/60 rounded-full animate-bounce animate-delay-300 opacity-50" />
      <div className="hidden lg:block absolute bottom-20 left-1/2 w-4 h-4 bg-tiffany-blue/60 rounded-full animate-pulse animate-delay-700 opacity-60" />

      {/* Diamond pattern constellation */}
      <div className="hidden lg:block absolute top-1/4 right-1/3 transform rotate-12">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 w-4 h-4 border border-aquamarine/30 transform rotate-45" />
          <div className="absolute top-2 left-2 w-4 h-4 border border-tiffany-blue/40 transform rotate-45" />
          <div className="absolute top-1 left-4 w-4 h-4 border border-turquoise/35 transform rotate-45" />
        </div>
      </div>

      {/* Animated connecting lines */}
      <div className="hidden xl:block absolute top-1/3 left-1/4 w-32 h-0.5 bg-gradient-to-r from-transparent via-aquamarine/30 to-transparent animate-pulse opacity-40" />
      <div className="hidden xl:block absolute bottom-1/3 right-1/4 w-24 h-0.5 bg-gradient-to-l from-transparent via-tiffany-blue/30 to-transparent animate-pulse animate-delay-1000 opacity-40" />
      <div className="hidden xl:block absolute top-1/2 left-1/2 w-0.5 h-20 bg-gradient-to-b from-transparent via-turquoise/30 to-transparent animate-pulse animate-delay-500 opacity-40" />

      {/* Floating particles constellation */}
      <div className="absolute inset-0">
        <div className="absolute top-[15%] left-[10%] w-1 h-1 bg-aquamarine/70 rounded-full animate-twinkle" />
        <div className="absolute top-[25%] left-[85%] w-1.5 h-1.5 bg-light-cyan/60 rounded-full animate-twinkle animate-delay-200" />
        <div className="absolute top-[45%] left-[5%] w-1 h-1 bg-tiffany-blue/80 rounded-full animate-twinkle animate-delay-400" />
        <div className="absolute top-[55%] left-[90%] w-1 h-1 bg-powder-blue/70 rounded-full animate-twinkle animate-delay-600" />
        <div className="absolute top-[75%] left-[15%] w-1.5 h-1.5 bg-turquoise/60 rounded-full animate-twinkle animate-delay-800" />
        <div className="absolute top-[85%] left-[80%] w-1 h-1 bg-medium-turquoise/80 rounded-full animate-twinkle animate-delay-1000" />

        {/* Additional scattered particles */}
        <div className="absolute top-[35%] left-[70%] w-0.5 h-0.5 bg-aquamarine/90 rounded-full animate-twinkle animate-delay-100" />
        <div className="absolute top-[65%] left-[25%] w-0.5 h-0.5 bg-light-cyan/90 rounded-full animate-twinkle animate-delay-300" />
        <div className="absolute top-[20%] left-[45%] w-0.5 h-0.5 bg-tiffany-blue/90 rounded-full animate-twinkle animate-delay-500" />
        <div className="absolute top-[80%] left-[55%] w-0.5 h-0.5 bg-persian-green/90 rounded-full animate-twinkle animate-delay-700" />
      </div>

      {/* Interactive gaming-themed elements */}
      <div className="hidden lg:block absolute top-[20%] right-[20%] opacity-30">
        <div className="w-8 h-8 border border-aquamarine/40 rounded transform rotate-45 animate-spin-slow">
          <div className="absolute inset-1 border border-tiffany-blue/30 rounded transform -rotate-45" />
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-[30%] left-[25%] opacity-30">
        <div className="w-6 h-6 relative">
          <div className="absolute inset-0 border border-turquoise/40 rounded-full animate-ping" />
          <div className="absolute inset-1 bg-aquamarine/20 rounded-full animate-pulse animate-delay-500" />
        </div>
      </div>

      {/* Enhanced floating controller with glow effect */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8">
        <div className="relative group">
          {/* Glow effect behind logo */}
          <div className="absolute inset-0 bg-aquamarine/20 rounded-full blur-lg scale-150 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="relative z-10 transform hover:scale-110 transition-transform duration-500">
            <Logo size="large" showText={false} />
          </div>
        </div>
      </div>

      {/* Subtle vignette effect */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-rich-black/20" />
    </div>
  );
}

export default memo(BackgroundDecor);
