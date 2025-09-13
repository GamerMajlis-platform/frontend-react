import { useTranslation } from "react-i18next";
import { BackgroundDecor } from "../components";

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useTranslation();

  return (
    <main className="relative w-full flex-1 flex items-center justify-center min-h-[calc(100vh-88px)] py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28">
      <BackgroundDecor />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28 text-center max-w-6xl relative z-10">
        {/* Main Content from Figma Design */}
        <div className="w-full flex flex-col items-center">
          <h1 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-center tracking-[0] leading-[normal] mb-3">
            {t("home.title")}
          </h1>
          <div className="w-[72px] sm:w-[100px] md:w-[121px] h-0.5 bg-[#6fffe9] mb-4"></div>
          <p className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-base sm:text-xl md:text-2xl lg:text-[28px] text-center tracking-[0] leading-[1.5] sm:leading-[1.3] md:leading-[normal] max-w-[280px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[884px] px-2 sm:px-4 md:px-0 mb-6">
            {t("home.subtitle")}
          </p>
          {/* Buttons from Figma Design - Stack on mobile, side by side on desktop */}
          <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8 md:gap-12 lg:gap-[68px] w-full max-w-[600px]">
            <button
              className="flex w-[48%] sm:w-[200px] md:w-[220px] lg:w-[245px] h-[40px] sm:h-[46px] md:h-[50px] items-center justify-center gap-2 px-5 sm:px-8 md:px-10 lg:px-12 py-2.5 bg-[#6fffe9] rounded-[30px] hover:bg-[#5ee6d3] transition-colors duration-200 cursor-pointer"
              type="button"
              aria-label={t("home.subscribe")}
              onClick={() => onNavigate?.("signup")}
            >
              <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-black text-base sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap">
                {t("home.subscribe")}
              </span>
            </button>

            <button
              className="flex w-[48%] sm:w-[200px] md:w-[220px] lg:w-[245px] h-[40px] sm:h-[46px] md:h-[50px] items-center justify-center gap-2 px-4 sm:px-[5px] py-2.5 rounded-[30px] border border-solid border-[#6fffe9] hover:bg-[#6fffe9] transition-colors duration-200 cursor-pointer group"
              type="button"
              aria-label={t("nav.tournaments")}
              onClick={() => onNavigate?.("tournaments")}
            >
              <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-[#eeeeee] text-base sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap group-hover:text-black transition-colors duration-200">
                {t("nav.tournaments")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* BackgroundDecor includes floating controller logo */}
    </main>
  );
}
