// Unified Card component for product / event / tournament presets.
// Preserves original layouts while reducing duplication across card types.
import { useEffect, useState, memo } from "react";
import { useTranslation } from "react-i18next";
import { useAppContext } from "../../context/useAppContext";
import { useNavigate } from "react-router-dom";
import {
  IconCalendar,
  IconLocation,
  IconOrganizer,
  IconTrophy,
  IconUsers,
} from "./icons";

// Common variant type for event & tournament presets
export type ActivityVariant = "upcoming" | "ongoing" | "past";

// Base props shared across presets
interface BaseCardProps {
  preset: "product" | "event" | "tournament";
  imageUrl?: string;
  className?: string; // Additional container classes
  onClick?: () => void;
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
  eventId?: number;
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
const eventVariantStyles: Record<ActivityVariant, { button: string }> = {
  upcoming: { button: "bg-dark-secondary" },
  ongoing: { button: "bg-primary text-black" },
  past: { button: "bg-dark-secondary opacity-80" },
};

const tournamentVariantStyles: Record<
  ActivityVariant,
  { card: string; button: string }
> = {
  upcoming: { card: "", button: "bg-dark-secondary" },
  ongoing: {
    card: "border-primary",
    button: "bg-primary text-black",
  },
  past: {
    card: "opacity-95",
    button: "bg-dark-secondary opacity-80",
  },
};

function CardComponent(props: CardProps) {
  // debug logs removed; centralized debug in src/i18n/config.ts handles translation checks
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

// Custom comparison tailored per preset to minimize re-renders
function areCardPropsEqual(prev: CardProps, next: CardProps) {
  // Different preset: must re-render
  if (prev.preset !== next.preset) return false;

  if (prev.preset === "product" && next.preset === "product") {
    return (
      prev.id === next.id &&
      prev.category === next.category &&
      prev.productName === next.productName &&
      prev.seller === next.seller &&
      prev.price === next.price &&
      prev.rate === next.rate &&
      prev.reviews === next.reviews &&
      prev.imageUrl === next.imageUrl &&
      prev.hideWishlistButton === next.hideWishlistButton &&
      prev.className === next.className
    );
  }

  if (prev.preset === "event" && next.preset === "event") {
    return (
      prev.variant === next.variant &&
      prev.name === next.name &&
      prev.organizer === next.organizer &&
      prev.scheduledOn === next.scheduledOn &&
      prev.location === next.location &&
      prev.eventId === next.eventId &&
      prev.imageUrl === next.imageUrl &&
      prev.className === next.className
    );
  }

  if (prev.preset === "tournament" && next.preset === "tournament") {
    return (
      prev.variant === next.variant &&
      prev.game === next.game &&
      prev.organizer === next.organizer &&
      prev.startDate === next.startDate &&
      prev.prizePool === next.prizePool &&
      prev.playersJoined === next.playersJoined &&
      prev.imageUrl === next.imageUrl &&
      prev.className === next.className
    );
  }

  return false;
}

// Centralized style token map (kept 1:1 with original classes for fidelity)
const presetStyles = {
  product: {
    // Use full width for the card container so it fits responsive grid cells
    container:
      "group relative z-20 flex h-[520px] sm:h-[480px] md:h-[500px] lg:h-[560px] w-full flex-col overflow-hidden rounded-2xl border border-slate-600 bg-slate-800 shadow-lg transition-all duration-300 ease-in-out hover:border-slate-500 hover:shadow-xl product-card",
    image:
      "relative h-[180px] sm:h-[200px] md:h-[220px] lg:h-[240px] shrink-0 bg-slate-700 product-card-image",
    content:
      "flex min-h-0 flex-1 flex-col p-3 sm:p-4 lg:p-5 product-card-content",
  },
  event: {
    container:
      "w-full max-w-[397px] rounded-[20px] bg-slate-600 border border-white overflow-hidden",
    bodyWrap: "flex flex-col gap-3 w-full p-3 sm:p-4",
    image:
      "w-full h-[180px] sm:h-[200px] lg:h-[224px] rounded-[15px] bg-dark-secondary bg-cover bg-center",
  },
  tournament: {
    container:
      "w-full max-w-[397px] h-auto min-h-[500px] sm:min-h-[550px] lg:min-h-[612px] relative bg-slate-600 border border-white rounded-[20px] sm:rounded-[25px] lg:rounded-[33px] overflow-hidden flex items-stretch justify-center mx-auto",
    inner:
      "flex flex-col gap-3 sm:gap-[14px] w-full max-w-[356px] h-full p-3 sm:p-4 lg:pt-4",
    image:
      "w-full h-[180px] sm:h-[200px] lg:h-[224px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] bg-dark-secondary bg-cover bg-center",
  },
} as const;

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
  onClick,
}: ProductPresetProps) {
  const { toggleWishlist, isInWishlist } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language && i18n.language.startsWith("ar");
  const hasArabicContent = isRTL || isRTLText(productName) || isRTLText(seller);

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      onClick?.();
    }
  };

  return (
    <div
      className={`${presetStyles.product.container} ${className}`}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyPress : undefined}
    >
      {/* Image Container */}
      <div className={presetStyles.product.image}>
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
            <span className="text-xs sm:text-sm">{t("product.noImage")}</span>
          </div>
        )}

        {/* Wishlist Button */}
        {!hideWishlistButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite();
            }}
            className={`absolute top-2 sm:top-3 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-white/20 text-sm sm:text-base text-white transition-colors duration-200 ease-in-out ${
              hasArabicContent
                ? "left-2 sm:left-3 right-auto"
                : "right-2 sm:right-3 left-auto"
            } bg-black/30 hover:bg-black/50`}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className={presetStyles.product.content}>
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
          {t("product.by")}{" "}
          <span className="font-medium text-primary">{seller}</span>
        </p>
        <div
          className={`mb-3 sm:mb-3.5 flex items-center gap-2 ${
            hasArabicContent ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="flex items-center gap-1 rounded-md bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-500">
            ★ {rate}
          </div>
          <span className="text-xs text-slate-400">
            {(() => {
              const m = reviews.match(/(\d+(?:[,\d]*)?)/);
              if (m) {
                const count = parseInt(m[1].replace(/,/g, ""), 10);
                if (i18n.exists("product.reviews")) {
                  return `(${t("product.reviews", { count })})`;
                }
              }
              return `(${reviews})`;
            })()}
          </span>
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
            {t("product.freeShipping")}
          </div>
          <div
            className={`mt-2 flex gap-2 sm:gap-2.5 product-card-buttons ${
              hasArabicContent ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
              className="flex-1 rounded-md border border-primary bg-transparent px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-medium transition-colors duration-200 ease-in-out product-card-button text-primary hover:bg-[#5ee6d3] hover:text-black hover:border-[#5ee6d3]"
            >
              {t("product.details")}
            </button>
            <button className="flex-1 rounded-md border-none bg-primary px-3 sm:px-4 py-2 sm:py-2.5 text-xs font-semibold text-black transition-colors duration-200 ease-in-out product-card-button hover:bg-[#5ee6d3]">
              {t("product.buyNow")}
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
  eventId,
}: EventPresetProps) {
  const current = eventVariantStyles[variant] || eventVariantStyles.upcoming;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isRegisteredForEvent, registerForEvent, unregisterFromEvent } =
    useAppContext();

  const [processing, setProcessing] = useState(false);

  const registered = eventId ? isRegisteredForEvent(eventId) : false;

  const handleAction = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!eventId) {
      // Fallback: navigate to details if no event id provided
      navigate?.(`/events/${eventId}`);
      return;
    }

    try {
      setProcessing(true);
      if (variant === "upcoming") {
        if (registered) {
          await unregisterFromEvent(eventId);
        } else {
          await registerForEvent(eventId);
        }
      } else {
        // ongoing or past -> view/spectate/results
        navigate(`/events/${eventId}`);
      }
    } catch (err) {
      console.error("Event action failed:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className={`${presetStyles.event.container} ${className}`}>
      <div className={presetStyles.event.bodyWrap}>
        <div className={presetStyles.event.image}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover rounded-[15px]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-dark-secondary rounded-[15px]" />
          )}
        </div>
        <div className="flex flex-col items-start gap-1">
          <h3 className="font-alice text-[20px] sm:text-[24px] lg:text-[28px] text-white m-0">
            {name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <IconOrganizer />
            <span>
              {t("labels.organizer")}: {organizer}
            </span>
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
        <button
          type="button"
          onClick={handleAction}
          className={`w-full h-[36px] sm:h-[40px] lg:h-[43px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center mt-3 ${current.button}`}
        >
          <span className="font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-6 text-white">
            {processing
              ? t("common.loading")
              : variant === "upcoming"
              ? registered
                ? t("activity.cancel")
                : t("activity.join")
              : variant === "ongoing"
              ? t("activity.watch")
              : t("activity.view")}
          </span>
        </button>
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
  const { t } = useTranslation();

  return (
    <div
      className={`${presetStyles.tournament.container} ${currentVariant.card} ${className}`}
    >
      <div className={presetStyles.tournament.inner}>
        <div className={presetStyles.tournament.image}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={game}
              className="w-full h-full object-cover rounded-[15px] sm:rounded-[18px] lg:rounded-[20px]"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-dark-secondary rounded-[15px] sm:rounded-[18px] lg:rounded-[20px]" />
          )}
        </div>
        <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full">
          <h3 className="w-full font-alice font-normal text-[20px] sm:text-[24px] lg:text-[28px] leading-tight text-center text-white m-0">
            {game}
          </h3>
          <p className="font-sans font-normal text-sm sm:text-base leading-[22px] text-slate-200 m-0">
            {t("labels.organizer")}: {organizer}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:gap-2.5 flex-1">
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconCalendar size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              {t("labels.startDate")}: {startDate}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconTrophy size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              {t("labels.prizePool")}: {prizePool}
            </span>
          </div>
          <div className="flex flex-row items-center gap-2 sm:gap-2.5 min-h-6 sm:min-h-8">
            <IconUsers size={16} />
            <span className="font-scheherazade font-bold text-[16px] sm:text-[18px] lg:text-[22px] leading-tight text-white">
              {t("labels.playersJoined")}: {playersJoined}
            </span>
          </div>
        </div>
        <div
          className={`w-full h-[36px] sm:h-[40px] lg:h-[43px] rounded-[8px] sm:rounded-[10px] flex items-center justify-center mt-2 sm:mt-2 ${currentVariant.button}`}
        >
          <span className="font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-6 text-white">
            {variant === "upcoming"
              ? t("activity.join")
              : variant === "ongoing"
              ? t("activity.watch")
              : t("activity.viewResults")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* Inline icon components removed; using shared icons from icons.tsx */
// Named export of types (optional usage elsewhere)
export type { ProductPresetProps, EventPresetProps, TournamentPresetProps };

// Memoize main component to avoid unnecessary re-renders when parent lists update
const Card = memo(CardComponent, areCardPropsEqual);
export default Card;
