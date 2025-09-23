import { useTranslation } from "react-i18next";

type Category = "upcoming" | "ongoing" | "past";

interface CategoryButtonsProps {
  category: Category;
  onCategoryChange: (category: Category) => void;
  translationPrefix: "events" | "tournaments";
}

export function CategoryButtons({
  category,
  onCategoryChange,
  translationPrefix,
}: CategoryButtonsProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 sm:mb-7 flex w-full flex-row flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-[100px]">
      {(["upcoming", "ongoing", "past"] as const).map((cat) => (
        <button
          key={cat}
          className={`h-[36px] sm:h-[40px] lg:h-[45px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] border-none px-4 sm:px-5 lg:px-6 text-center font-medium text-[16px] sm:text-[18px] lg:text-[22px] leading-tight transition-colors ${
            category === cat
              ? "bg-[#6FFFE9] text-black"
              : "bg-transparent text-white hover:bg-white/10"
          }`}
          onClick={() => onCategoryChange(cat)}
        >
          {t(`${translationPrefix}:categories.${cat}`)}
        </button>
      ))}
    </div>
  );
}
