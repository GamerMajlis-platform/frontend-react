// Shared SVG icon components
export const IconCalendar = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
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

export const IconLocation = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
  >
    <path
      d="M21 10c0 6-9 12-9 12S3 16 3 10a9 9 0 1 1 18 0Z"
      stroke="#fff"
      strokeWidth="1.5"
    />
    <circle cx="12" cy="10" r="2.5" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

export const IconOrganizer = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
  >
    <circle cx="12" cy="8" r="3" stroke="#fff" strokeWidth="1.5" />
    <path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="#fff" strokeWidth="1.5" />
  </svg>
);

export const IconTrophy = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
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

export const IconUsers = ({ size = 20 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
  >
    <circle cx="12" cy="7" r="4" stroke="#fff" strokeWidth="2" />
    <path d="M4 21a8 8 0 0 1 16 0" stroke="#fff" strokeWidth="2" />
  </svg>
);

export const IconStar = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
  >
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke="#fff"
      strokeWidth="1.5"
    />
  </svg>
);

export const IconSearch = ({ size = 18 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block align-[-2px]"
  >
    <path
      d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21 21L17 17"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
