import { useTranslation } from "react-i18next";
import { Logo } from "../components";

interface HomeProps {
  onNavigate?: (page: string) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { t } = useTranslation();

  return (
    <main className="relative w-full flex-1 flex items-center justify-center min-h-[calc(100vh-88px)] py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28">
      {/* Background decorative elements - hide on mobile for cleaner look */}
      <div className="hidden md:block absolute top-24 left-16 w-16 h-16 lg:w-20 lg:h-20 border-2 lg:border-4 border-[#5BC0BE] rotate-45 opacity-60"></div>
      <div className="hidden md:block absolute top-40 right-24 w-20 h-20 lg:w-24 lg:h-24 border-2 lg:border-4 border-[#5BC0BE] rounded-full opacity-60"></div>
      <div className="hidden md:block absolute bottom-32 right-16 w-12 h-12 lg:w-16 lg:h-16 border-2 lg:border-4 border-[#5BC0BE] rotate-45 opacity-60"></div>
      <div className="hidden lg:block absolute bottom-48 left-20 w-6 h-6 bg-[#6FFFE9] rounded-full opacity-40"></div>
      <div className="hidden lg:block absolute top-1/3 left-1/4 w-2 h-2 bg-[#6FFFE9] rounded-full opacity-60"></div>
      <div className="hidden lg:block absolute top-2/3 right-1/3 w-3 h-3 bg-[#6FFFE9] rounded-full opacity-50"></div>

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28 text-center max-w-6xl">
        {/* Main Content from Figma Design */}
        <div className="w-full flex flex-col items-center">
          <h1
            className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center tracking-[0] leading-[normal]"
            style={{ marginBottom: "0.75rem" }}
          >
            {t("home.title")}
          </h1>
          <div
            className="w-[80px] sm:w-[100px] md:w-[121px] h-0.5 bg-[#6fffe9]"
            style={{ marginBottom: "1rem" }}
          ></div>
          <p
            className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-xl md:text-2xl lg:text-[28px] text-center tracking-[0] leading-[1.4] sm:leading-[1.3] md:leading-[normal] max-w-[300px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[884px] px-2 sm:px-4 md:px-0"
            style={{ marginBottom: "1.5rem" }}
          >
            {t("home.subtitle")}
          </p>
          {/* Buttons from Figma Design - Stack on mobile, side by side on desktop */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-12 lg:gap-[68px] w-full max-w-[600px]">
            <button
              className="flex w-full sm:w-[200px] md:w-[220px] lg:w-[245px] h-[45px] sm:h-[48px] md:h-[50px] items-center justify-center gap-2.5 px-6 sm:px-8 md:px-10 lg:px-12 py-[10px] md:py-[11px] bg-[#6fffe9] rounded-[30px] hover:bg-[#5ee6d3] transition-colors duration-200 cursor-pointer"
              type="button"
              aria-label={t("home.signupFree")}
              onClick={() => onNavigate?.("signup")}
            >
              <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-black text-lg sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap">
                {t("home.signupFree")}
              </span>
            </button>

            <button
              className="flex w-full sm:w-[200px] md:w-[220px] lg:w-[245px] h-[45px] sm:h-[48px] md:h-[50px] items-center justify-center gap-2.5 px-4 sm:px-[5px] py-[10px] md:py-[11px] rounded-[30px] border border-solid border-[#6fffe9] hover:bg-[#6fffe9] transition-colors duration-200 cursor-pointer group"
              type="button"
              aria-label={t("home.viewTournaments")}
              onClick={() => onNavigate?.("tournaments")}
            >
              <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-[#eeeeee] text-lg sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap group-hover:text-black transition-colors duration-200">
                {t("home.viewTournaments")}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom logo - responsive positioning */}
      <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 lg:bottom-12 lg:left-12">
        <Logo size="large" showText={false} />
      </div>
    </main>
  );
}
