/**
 * Unified Card component supporting three presets: product, event, tournament.
 * Each preset reproduces the exact original layout, sizes, alignment and behavior
 * of the previous individual components (ProductCard, EventCard, TournamentCard)
 * so existing visuals are preserved while eliminating duplication.
 *
 * DRY Strategy:
 *  - A discriminated union on `preset` provides strong typing for required fields.
 *  - Variant styling (upcoming | ongoing | past) centralized for event & tournament.
 *  - Product wishlist + RTL logic retained exactly from original ProductCard.
 *  - Minimal abstraction to avoid layout regressions; only safely shared utilities.
 */
import { useEffect, useState } from "react";
import { useAppContext } from "../context/useAppContext";

// Common variant type for event & tournament presets
export type ActivityVariant = "upcoming" | "ongoing" | "past";

// Base props shared across presets
interface BaseCardProps {
  preset: "product" | "event" | "tournament";
  imageUrl?: string;
  className?: string; // Additional container classes
}

// Product preset props (mirrors original ProductCard)
interface ProductPresetProps extends BaseCardProps {
  preset: "product";
  id: number;
  category: string;
  productName: string;
  seller: string;
  price: string;
  rate: string; // kept as string to match original prop shape
  reviews: string;
  hideWishlistButton?: boolean;
}

// Event preset props
interface EventPresetProps extends BaseCardProps {
  preset: "event";
  variant?: ActivityVariant;
  name: string;
  organizer: string;
  scheduledOn: string;
  location: string;
}

// Tournament preset props
interface TournamentPresetProps extends BaseCardProps {
  preset: "tournament";
  variant?: ActivityVariant;
  game: string;
  organizer: string;
  startDate: string;
  prizePool: string;
  playersJoined: number;
}

export type CardProps =
  | ProductPresetProps
  | EventPresetProps
  | TournamentPresetProps;

// Utility: RTL text detection (Arabic range)
const isRTLText = (text: string): boolean =>
  /[\u0600-\u06FF\u0750-\u077F]/.test(text);

// Shared variant style maps
const eventVariantStyles: Record<
  ActivityVariant,
  { button: string; buttonText: string }
> = {
  upcoming: { button: "bg-dark-secondary", buttonText: "Join" },
  ongoing: { button: "bg-primary text-black", buttonText: "Watch" },
  past: { button: "bg-dark-secondary opacity-80", buttonText: "View" },
};

const tournamentVariantStyles: Record<
  ActivityVariant,
  { card: string; button: string; buttonText: string }
> = {
  upcoming: { card: "", button: "bg-dark-secondary", buttonText: "Join" },
  ongoing: {
    card: "border-primary",
    button: "bg-primary text-black",
    buttonText: "Watch",
  },
  past: {
    card: "opacity-95",
    button: "bg-dark-secondary opacity-80",
    buttonText: "View Results",
  },
};

export default function Card(props: CardProps) {
  switch (props.preset) {
    case "product":
      return <ProductPreset {...props} />;
    case "event":
      return <EventPreset {...props} />;
    case "tournament":
      return <TournamentPreset {...props} />;
    default:
      return null;
  }
}

/* ----------------------------- PRODUCT PRESET ----------------------------- */
function ProductPreset({
  id,
  category,
  productName,
  seller,
  price,
  rate,
  reviews,
  imageUrl,
  className = "",
  hideWishlistButton,
}: ProductPresetProps) {
  const { toggleWishlist, isInWishlist } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isDetailsHovered, setIsDetailsHovered] = useState(false);
  const [isBuyHovered, setIsBuyHovered] = useState(false);
  const [isWishlistHovered, setIsWishlistHovered] = useState(false);

  const hasArabicContent = isRTLText(productName) || isRTLText(seller);

  useEffect(() => {
    setIsFavorite(isInWishlist(id));
  }, [id, isInWishlist]);

  const toggleFavorite = () => {
    toggleWishlist({
      id,
      category,
      productName,
      seller,
      price,
      rate,
      reviews,
      imageUrl,
    });
    setIsFavorite((prev) => !prev);
  };

  return (
    <div
      className={`group relative z-20 flex h-[520px] sm:h-[480px] md:h-[500px] lg:h-[560px] w-full max-w-[420px] min-w-[280px] flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-800 shadow-lg transition-all duration-300 ease-in-out hover:border-slate-500 hover:shadow-xl product-card ${className}`}
    >
      {/* Image Container */}
      <div className="relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] shrink-0 bg-slate-700 product-card-image">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productName}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
            <div className="mb-2 text-3xl sm:text-4xl">📷</div>
            <span className="text-xs sm:text-sm">No Image</span>
          </div>
        )}

        {/* Category Badge */}
        <div
          className={`absolute top-2 sm:top-3 max-w-[100px] sm:max-w-[120px] overflow-hidden text-ellipsis whitespace-nowrap rounded-md bg-primary px-2 py-1 text-xs font-semibold text-black ${
            hasArabicContent
              ? "right-2 sm:right-3 left-auto"
              : "left-2 sm:left-3 right-auto"
          }`}
        >
          {category}
        </div>

        {/* Wishlist Button */}
        {!hideWishlistButton && (
          <button
            onClick={toggleFavorite}
            className={`absolute top-2 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/20 text-sm sm:text-base text-white transition-all duration-200 ease-in-out ${
              hasArabicContent
                ? "left-2 sm:left-3 right-auto"
                : "right-2 sm:right-3 left-auto"
            } ${isWishlistHovered ? "bg-black/50" : "bg-black/30"}`}
            onMouseEnter={() => setIsWishlistHovered(true)}
            onMouseLeave={() => setIsWishlistHovered(false)}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-5 product-card-content">
        <h3
          className={`mb-2 sm:mb-2.5 line-clamp-3 min-h-[54px] sm:min-h-[60px] md:min-h-[64px] lg:min-h-[72px] text-sm sm:text-base lg:text-[17px] font-semibold leading-relaxed text-white product-card-title ${
            hasArabicContent
              ? "text-right font-scheherazade"
              : "text-left font-sans"
          }`}
        >
          {productName}
        </h3>
        <p
          className={`mb-3 sm:mb-3.5 line-clamp-2 min-h-[28px] sm:min-h-[32px] md:min-h-[36px] lg:min-h-[40px] text-xs sm:text-sm leading-relaxed text-slate-400 product-card-seller ${
            hasArabicContent
              ? "text-right font-scheherazade"
              : "text-left font-sans"
          }`}
        >
          by <span className="font-medium text-primary">{seller}</span>
        </p>
        <div
          className={`mb-3 sm:mb-3.5 flex items-center gap-2 ${
            hasArabicContent ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-500">
            ★ {rate}
          </div>
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>
        <div className="mt-auto pt-2 sm:pt-3 lg:pt-3.5 pb-1">
          <div
            className={`mb-1 text-base sm:text-lg font-bold text-white product-card-price ${
              hasArabicContent ? "text-right" : "text-left"
            }`}
          >
            {price}
          </div>
          <div
            className={`mb-2 sm:mb-3 text-xs text-slate-500 ${
              hasArabicContent ? "text-right" : "text-left"
            }`}
          >
            Free shipping
          </div>
          <div
            className={`mt-2 flex gap-2 sm:gap-2.5 product-card-buttons ${
              hasArabicContent ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <button
              className={`flex-1 rounded-md border border-primary bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium transition-colors duration-200 ease-in-out product-card-button ${
                isDetailsHovered
                  ? "bg-[#5ee6d3] text-black border-[#5ee6d3]"
                  : "text-primary"
              }`}
              onMouseEnter={() => setIsDetailsHovered(true)}
              onMouseLeave={() => setIsDetailsHovered(false)}
            >
              Details
            </button>
            <button
              className={`flex-1 rounded-md border-none bg-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-black transition-colors duration-200 ease-in-out product-card-button ${
                isBuyHovered ? "bg-[#5ee6d3]" : ""
              }`}
              onMouseEnter={() => setIsBuyHovered(true)}
              onMouseLeave={() => setIsBuyHovered(false)}
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- EVENT PRESET ------------------------------ */
function EventPreset({
  variant = "upcoming",
  imageUrl,
  name,
  organizer,
  scheduledOn,
  location,
  className = "",
}: EventPresetProps) {
  const current = eventVariantStyles[variant] || eventVariantStyles.upcoming;

  return (
    <div
      className={`w-full max-w-[397px] rounded-[20px] bg-slate-600 border border-white overflow-hidden ${className}`}
    >
      <div className="flex flex-col gap-3 w-full p-3 sm:p-4">
        <div
          className={`w-full h-[180px] sm:h-[200px] lg:h-[224px] rounded-[15px] bg-dark-secondary bg-cover bg-center ${
            !imageUrl && "bg-dark-secondary"
          }`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        />
        <div className="flex flex-col items-start gap-1">
          <h3 className="font-alice text-[20px] sm:text-[24px] lg:text-[28px] text-white m-0">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <IconOrganizer />
            <span>By {organizer}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2 mt-2">
          <div className="flex items-center gap-2">
            <IconCalendar size={16} />
            <span className="text-white font-scheherazade font-bold">
              {scheduledOn}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconLocation size={16} />
            <span className="text-white font-scheherazade font-bold">
              {location}
            </span>
          </div>
        </div>
        <div
          className={`w-full h-[36px] sm:h-[40px] lg:h-[43px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center mt-3 ${current.button}`}
        >
          <span className="font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-6 text-white">
            {current.buttonText}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------- TOURNAMENT PRESET --------------------------- */
function TournamentPreset({
  variant = "upcoming",
  imageUrl,
  game,
  organizer,
  startDate,
  prizePool,
  playersJoined,
  className = "",
}: TournamentPresetProps) {
  const currentVariant =
    tournamentVariantStyles[variant] || tournamentVariantStyles.upcoming;

  return (
    <div
      className={`w-full max-w-[397px] h-auto min-h-[500px] sm:min-h-[550px] lg:min-h-[612px] relative bg-slate-600 border border-white rounded-[20px] sm:rounded-[25px] lg:rounded-[33px] overflow-hidden flex items-stretch justify-center mx-auto ${currentVariant.card} ${className}`}
    >
      <div className="flex flex-col gap-3 sm:gap-[14px] w-full max-w-[356px] h-full p-3 sm:p-4 lg:pt-4">
        <div
          className={`w-full h-[180px] sm:h-[200px] lg:h-[224px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] bg-dark-secondary bg-cover bg-center ${
            !imageUrl && "bg-dark-secondary"
          }`}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        />
        <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full">
          <h3 className="w-full font-alice font-normal text-[20px] sm:text-[24px] lg:text-[28px] leading-tight text-center text-white m-0">
            {game}
          </h3>
          <p className="font-sans font-normal text-sm sm:text-base leading-[22px] text-slate-200 m-0">
            By {organizer}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:gap-2.5 flex-1">
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconCalendar size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              Start Date: {startDate}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconTrophy size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              Prize Pool: {prizePool}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconUsers size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              Players Joined: {playersJoined}
            </span>
          </div>
        </div>
        <div
          className={`w-full h-[36px] sm:h-[40px] lg:h-[43px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center mt-2 sm:mt-2 ${currentVariant.button}`}
        >
          <span className="font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-6 text-white">
            {currentVariant.buttonText}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------- INLINE ICONS ------------------------------ */
const IconCalendar = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="16"
      rx="2"
      stroke="#fff"
      strokeWidth="1.5"
    />
    <path d="M8 2v4M16 2v4M3 10h18" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

const IconLocation = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path
      d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1118 0z"
      stroke="#fff"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="10" r="2.5" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

const IconOrganizer = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <circle cx="12" cy="8" r="3" stroke="#fff" strokeWidth="1.5" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

// Tournament-specific icons with thicker strokes (kept separate for fidelity)
const IconTrophy = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <path d="M8 21h8M12 17v4" stroke="#fff" strokeWidth="2" />
    <path d="M17 4H7v4a5 5 0 1 0 10 0V4Z" stroke="#fff" strokeWidth="2" />
    <path
      d="M7 6H5a2 2 0 0 0-2 2v1a4 4 0 0 0 4 4"
      stroke="#fff"
      strokeWidth="2"
    />
    <path
      d="M17 6h2a2 2 0 0 1 2 2v1a4 4 0 0 1-4 4"
      stroke="#fff"
      strokeWidth="2"
    />
  </svg>
);

const IconUsers = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
  >
    <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2" />
    <path d="M4 21a8 8 0 0 1 16 0" stroke="#fff" strokeWidth="2" />
  </svg>
);
// Named export of types (optional usage elsewhere)
export type { ProductPresetProps, EventPresetProps, TournamentPresetProps };
