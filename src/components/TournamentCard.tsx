import type { CSSProperties } from "react";

export type TournamentVariant = "upcoming" | "ongoing" | "past";

interface TournamentCardProps {
  variant?: TournamentVariant; // styling only; actual filtering is external
  imageUrl?: string;
  game: string;
  organizer: string;
  startDate: string;
  prizePool: string;
  playersJoined: number;
  className?: string;
}

const cardBase: CSSProperties = {
  width: "397px",
  height: "612px",
  position: "relative",
  background: "#3A506B",
  border: "1px solid #FFFFFF",
  borderRadius: "33px",
  overflow: "hidden",
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
};

const contentWrap: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  width: "356px",
  height: "551px",
  paddingTop: "16px",
};

const imageStyle: CSSProperties = {
  width: "356px",
  height: "224px",
  borderRadius: "20px",
  backgroundColor: "#1C2541",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const titleBlock: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  width: "356px",
};

const gameTitle: CSSProperties = {
  width: "100%",
  fontFamily: "Alice, Helvetica, sans-serif",
  fontWeight: 400,
  fontSize: "28px",
  lineHeight: "34px",
  textAlign: "center" as const,
  color: "#FFFFFF",
  margin: 0,
};

const byText: CSSProperties = {
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontWeight: 400,
  fontSize: "16px",
  lineHeight: "22px",
  color: "#e2e8f0",
  margin: 0,
};

const infoList: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
};

const row: CSSProperties = {
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "10px",
  minHeight: "32px",
};

const rowLabel: CSSProperties = {
  fontFamily: "'Scheherazade New', Georgia, serif",
  fontWeight: 700,
  fontSize: "22px",
  lineHeight: "28px",
  color: "#FFFFFF",
};

const bottomBar: CSSProperties = {
  width: "356px",
  height: "43px",
  background: "#1C2541",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "8px",
};

const bottomText: CSSProperties = {
  fontFamily: "Inter, system-ui, sans-serif",
  fontWeight: 700,
  fontSize: "20px",
  lineHeight: "24px",
  color: "#FFFFFF",
};

function getVariantStyles(variant: TournamentVariant) {
  switch (variant) {
    case "ongoing":
      return {
        card: { border: "1px solid #6FFFE9" } as CSSProperties,
        button: {
          ...bottomBar,
          background: "#6FFFE9",
          color: "#000",
        } as CSSProperties,
        buttonText: "Watch",
      };
    case "past":
      return {
        card: { opacity: 0.95 } as CSSProperties,
        button: {
          ...bottomBar,
          background: "#1C2541",
          opacity: 0.8,
        } as CSSProperties,
        buttonText: "View Results",
      };
    case "upcoming":
    default:
      return {
        card: {} as CSSProperties,
        button: bottomBar,
        buttonText: "Join",
      };
  }
}

// Simple inline SVG icons to avoid extra deps
const IconCalendar = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
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
  const v = getVariantStyles(variant);

  return (
    <div style={{ ...cardBase, ...v.card }} className={className}>
      <div style={contentWrap}>
        {/* Image */}
        <div
          style={{
            ...imageStyle,
            backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
          }}
        />

        {/* Title + Organizer */}
        <div style={titleBlock}>
          <h3 style={gameTitle}>{game}</h3>
          <p style={byText}>By {organizer}</p>
        </div>

        {/* Info */}
        <div style={infoList}>
          <div style={row}>
            <IconCalendar />
            <span style={rowLabel}>Start Date: {startDate}</span>
          </div>
          <div style={row}>
            <IconTrophy />
            <span style={rowLabel}>Prize Pool: {prizePool}</span>
          </div>
          <div style={{ ...row, justifyContent: "flex-start" }}>
            <IconUsers />
            <span style={rowLabel}>Players Joined: {playersJoined}</span>
          </div>
        </div>

        {/* Action */}
        <div style={v.button}>
          <span style={bottomText}>{v.buttonText}</span>
        </div>
      </div>
    </div>
  );
}
