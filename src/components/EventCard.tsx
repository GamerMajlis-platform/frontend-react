type EventVariant = "upcoming" | "ongoing" | "past";

interface EventCardProps {
  variant?: EventVariant;
  imageUrl?: string;
  name: string;
  organizer: string;
  scheduledOn: string;
  location: string;
  className?: string;
}

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

export default function EventCard({
  variant = "upcoming",
  imageUrl,
  name,
  organizer,
  scheduledOn,
  location,
  className = "",
}: EventCardProps) {
  const variantStyles = {
    upcoming: { button: "bg-dark-secondary", buttonText: "Join" },
    ongoing: { button: "bg-primary text-black", buttonText: "Watch" },
    past: { button: "bg-dark-secondary opacity-80", buttonText: "View" },
  } as const;

  const current =
    variantStyles[variant as keyof typeof variantStyles] ||
    variantStyles.upcoming;

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
            <IconCalendar />
            <span className="text-white font-scheherazade font-bold">
              {scheduledOn}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <IconLocation />
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
