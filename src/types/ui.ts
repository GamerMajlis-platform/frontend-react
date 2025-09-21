// UI component types - consolidated from components

import type { ReactNode } from "react";
import type { BaseProps, Option, Size, ColorVariant } from "./common";

// Button types
export interface ButtonProps extends BaseProps {
  type?: "button" | "submit" | "reset";
  variant?: ColorVariant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  onClick?: () => void;
}

// Card types
export interface BaseCardProps {
  className?: string;
  imageUrl?: string;
}

export interface ProductPresetProps extends BaseCardProps {
  preset: "product";
  variant?: never;
  productName: string;
  seller: string;
  price: string;
  rate: string;
  reviews: string;
}

export interface EventPresetProps extends BaseCardProps {
  preset: "event";
  variant?: "upcoming" | "ongoing" | "past";
  title: string;
  organizer: string;
  location: string;
  startDate: string;
  registered: number;
  maxCapacity: number;
}

export interface TournamentPresetProps extends BaseCardProps {
  preset: "tournament";
  variant?: "upcoming" | "ongoing" | "past";
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

// Dropdown types
export interface DropdownOption extends Option {
  disabled?: boolean;
}

export interface DropdownProps {
  type: string;
  value: string;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onSelect: (value: string) => void;
  isOpen: boolean;
  onToggle: (type: string) => void;
}

// Toggle types
export interface ToggleButtonProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: Size;
  className?: string;
}

// Progress bar types
export interface ProgressBarProps {
  percentage: number;
  className?: string;
  gradientFrom?: string;
  gradientTo?: string;
  animated?: boolean;
  showLabel?: boolean;
}

// Modal types
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: Size;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

// Header types
export interface HeaderProps {
  onNavigate?: (page: string) => void;
  className?: string;
}

// Logo types
export interface LogoProps {
  size?: Size;
  variant?: "full" | "icon" | "text";
  className?: string;
}

// Language switcher types
export interface LanguageSwitcherProps {
  className?: string;
  variant?: "dark" | "light";
}

// Chat bot types
export interface ChatBotProps {
  className?: string;
  position?: "bottom-right" | "bottom-left";
  theme?: "light" | "dark";
}

// Empty state types
export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

// Sort component types
export interface SortByProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholderKey?: string;
  className?: string;
  disabled?: boolean;
}

// Profile dropdown types
export interface ProfileDropdownProps {
  onSectionChange?: (section: string) => void;
  userInfo?: { name: string; email: string };
  className?: string;
}

// Tab bar types
export type TabKey = "about" | "preferences" | "stats";

export interface TabBarProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  className?: string;
}

// Setting row types
export interface SettingRowProps {
  label: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

// Mobile menu types
export interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
  className?: string;
}

// Profile section types
export interface ProfileHeaderProps {
  username: string;
  displayName?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: string;
  onEdit?: () => void;
  className?: string;
}

export interface StatsListProps {
  stats: {
    gamesPlayed: number;
    tournamentsWon: number;
    winRate: number;
    rank: string;
    level: number;
    experience: number;
  };
  className?: string;
}
