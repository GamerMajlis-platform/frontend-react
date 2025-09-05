type TournamentVariant = "upcoming" | "ongoing" | "past";

interface TournamentCardProps {
  variant?: TournamentVariant;
  imageUrl?: string;
  game: string;
  organizer: string;
  startDate: string;
  prizePool: string;
  playersJoined: number;
  className?: string;
}

// Simple inline SVG icons to avoid extra deps
const IconCalendar = ({ size = 20 }: { size?: number }) => (
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
      y="5"
      width="18"
      height="16"
      rx="2"
      stroke="#fff"
      strokeWidth="2"
    />
    <path d="M8 3v4M16 3v4M3 11h18" stroke="#fff" strokeWidth="2" />
  </svg>
);

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

export default function TournamentCard({
  variant = "upcoming",
  imageUrl,
  game,
  organizer,
  startDate,
  prizePool,
  playersJoined,
  className = "",
}: TournamentCardProps) {
  // Determine variant-specific styling
  const variantStyles = {
    upcoming: {
      card: "",
      button: "bg-dark-secondary",
      buttonText: "Join",
    },
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

  const currentVariant =
    variantStyles[variant as keyof typeof variantStyles] ||
    variantStyles.upcoming;

  return (
    <div
      className={`
        w-full max-w-[397px] h-auto min-h-[500px] sm:min-h-[550px] lg:min-h-[612px] 
        relative bg-slate-600 border border-white rounded-[20px] sm:rounded-[25px] lg:rounded-[33px] 
        overflow-hidden flex items-stretch justify-center mx-auto
        ${currentVariant.card} ${className}
      `}
    >
      <div className="flex flex-col gap-3 sm:gap-[14px] w-full max-w-[356px] h-full p-3 sm:p-4 lg:pt-4">
        {/* Image */}
        <div
          className={`
            w-full h-[180px] sm:h-[200px] lg:h-[224px] rounded-[15px] sm:rounded-[18px] lg:rounded-[20px] 
            bg-dark-secondary bg-cover bg-center
            ${!imageUrl && "bg-dark-secondary"}
          `}
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}}
        />

        {/* Title + Organizer */}
        <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full">
          <h3 className="w-full font-alice font-normal text-[20px] sm:text-[24px] lg:text-[28px] leading-tight text-center text-white m-0">
            {game}
          </h3>
          <p className="font-sans font-normal text-sm sm:text-base leading-[22px] text-slate-200 m-0">
            By {organizer}
          </p>
        </div>

        {/* Info */}
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

        {/* Action Button */}
        <div
          className={`
            w-full h-[36px] sm:h-[40px] lg:h-[43px] rounded-[8px] sm:rounded-[10px] 
            flex items-center justify-center mt-2 sm:mt-2
            ${currentVariant.button}
          `}
        >
          <span className="font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] leading-6 text-white">
            {currentVariant.buttonText}
          </span>
        </div>
      </div>
    </div>
  );
}
