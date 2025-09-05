import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAppContext } from "../context/useAppContext";
import usePreferences from "../hooks/usePreferences";
import { colors, fonts, transitions } from "../styles/BaseStyles";

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    marketplace: boolean;
    tournaments: boolean;
  };
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
    showGameActivity: boolean;
  };
  preferences: {
    language: string;
    theme: "dark" | "light" | "auto";
    currency: string;
  };
}

export default function Settings() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useAppContext();
  const { setLanguage, setTheme } = usePreferences();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // RTL detection - optimized
  const isRTL =
    document.documentElement.dir === "rtl" ||
    document.documentElement.lang === "ar" ||
    /[\u0600-\u06FF\u0750-\u077F]/.test(document.body.innerText || "");

  const getToggleStyles = (isActive: boolean) => ({
    button: {
      backgroundColor: isActive ? colors.primary : colors.textMuted,
      direction: isRTL ? "rtl" : "ltr",
    },
    switch: {
      left: isRTL ? (isActive ? "2px" : "26px") : isActive ? "26px" : "2px",
    },
  });

  // Consolidated handlers
  const handleToggle = (category: keyof UserSettings, setting: string) => {
    const group = settings[category] as Record<string, string | boolean>;
    updateSetting(category, setting, !group[setting]);
  };

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown));
  };

  // Configuration objects - reduces code repetition
  const settingsConfig = {
    notifications: [
      {
        key: "email",
        label: t("settings.sections.notifications.email"),
        description: t("settings.sections.notifications.email_desc"),
      },
      {
        key: "push",
        label: t("settings.sections.notifications.push"),
        description: t("settings.sections.notifications.push_desc"),
      },
      {
        key: "marketplace",
        label: t("settings.sections.notifications.marketplace"),
        description: t("settings.sections.notifications.marketplace_desc"),
      },
      {
        key: "tournaments",
        label: t("settings.sections.notifications.tournaments"),
        description: t("settings.sections.notifications.tournaments_desc"),
      },
    ],
    privacy: [
      {
        key: "showOnlineStatus",
        label: t("settings.sections.privacy.showOnlineStatus"),
        description: t("settings.sections.privacy.showOnlineStatus_desc"),
      },
      {
        key: "showGameActivity",
        label: t("settings.sections.privacy.showGameActivity"),
        description: t("settings.sections.privacy.showGameActivity_desc"),
      },
    ],
  };

  const dropdownOptions = {
    profileVisibility: [
      {
        value: "public",
        label: t("settings.sections.privacy.visibility.public"),
      },
      {
        value: "friends",
        label: t("settings.sections.privacy.visibility.friends"),
      },
      {
        value: "private",
        label: t("settings.sections.privacy.visibility.private"),
      },
    ],
    language: [
      {
        value: "en",
        label: t("settings.sections.preferences.language_options.en"),
      },
      {
        value: "ar",
        label: t("settings.sections.preferences.language_options.ar"),
      },
    ],
    theme: [
      {
        value: "dark",
        label: t("settings.sections.preferences.theme_options.dark"),
      },
      {
        value: "light",
        label: t("settings.sections.preferences.theme_options.light"),
      },
      {
        value: "auto",
        label: t("settings.sections.preferences.theme_options.auto"),
      },
    ],
    currency: [
      { value: "USD", label: "USD ($)" },
      { value: "EUR", label: "EUR (€)" },
      { value: "SAR", label: "SAR (﷼)" },
    ],
  };

  // Reusable components
  const ToggleButton = ({
    value,
    onClick,
  }: {
    value: boolean;
    onClick: () => void;
  }) => {
    const toggleStyles = getToggleStyles(value);
    return (
      <button
        className="w-12 h-6 rounded-xl border-none cursor-pointer relative"
        style={{
          backgroundColor: toggleStyles.button.backgroundColor,
          direction: toggleStyles.button.direction as "ltr" | "rtl",
          transition: transitions.normal,
        }}
        onClick={onClick}
      >
        <div
          className="w-5 h-5 bg-white rounded-full absolute top-0.5"
          style={{
            left: toggleStyles.switch.left,
            transition: transitions.normal,
          }}
        />
      </button>
    );
  };

  const Dropdown = ({
    type,
    value,
    options,
    onSelect,
  }: {
    type: string;
    value: string;
    options: Array<{ value: string; label: string }>;
    onSelect: (value: string) => void;
  }) => (
    <div className="relative">
      <button
        className="flex items-center justify-between py-2 px-3 rounded-md cursor-pointer min-w-[120px] text-sm"
        style={{
          backgroundColor: colors.darkSecondary,
          border: `1px solid ${colors.textMuted}`,
          color: colors.text,
          transition: transitions.fast,
        }}
        onClick={() => toggleDropdown(type)}
      >
        {options.find((opt) => opt.value === value)?.label || value}
        <svg
          className="w-4 h-4"
          style={{
            transition: transitions.fast,
            transform:
              openDropdown === type ? "rotate(180deg)" : "rotate(0deg)",
          }}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </button>
      {openDropdown === type && (
        <div
          className="absolute top-full right-0 mt-1 rounded-md shadow-lg z-10 min-w-[120px]"
          style={{
            backgroundColor: colors.darkSecondary,
            border: `1px solid ${colors.textMuted}`,
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              className="block w-full py-2 px-3 bg-transparent border-none text-left cursor-pointer text-sm hover:bg-opacity-80"
              style={{
                color: colors.text,
                transition: transitions.fast,
              }}
              onClick={() => {
                onSelect(option.value);
                toggleDropdown(type);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const SettingRow = ({
    label,
    description,
    children,
    isLast = false,
  }: {
    label: string;
    description: string;
    children: React.ReactNode;
    isLast?: boolean;
  }) => (
    <div
      className={`flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4 py-3 sm:py-4 ${
        !isLast ? "border-b" : ""
      }`}
      style={{
        borderBottomColor: !isLast ? colors.textMuted : "transparent",
      }}
    >
      <div className="flex-1">
        <div
          className="font-medium mb-1 text-sm sm:text-base"
          style={{ color: colors.text }}
        >
          {label}
        </div>
        <div
          className="text-xs sm:text-sm"
          style={{ color: colors.textSecondary }}
        >
          {description}
        </div>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  return (
    <main
      className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-6 pb-6"
      style={{ minHeight: "calc(100vh - 88px)" }}
    >
      <div className="w-full">
        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1
            className="text-xl sm:text-2xl font-semibold mb-2"
            style={{
              fontFamily: fonts.alice,
              color: colors.text,
            }}
          >
            {t("settings.title")}
          </h1>
          <p
            className="text-sm sm:text-base mb-6 sm:mb-8"
            style={{ color: colors.textSecondary }}
          >
            {t("settings.subtitle")}
          </p>
        </header>

        {/* Notifications Section */}
        <section
          className="rounded-xl p-4 sm:p-6 mb-4 sm:mb-6"
          style={{ backgroundColor: colors.darkSecondary }}
        >
          <h2
            className="text-lg sm:text-xl font-semibold mb-2"
            style={{
              fontFamily: fonts.alice,
              color: colors.text,
            }}
          >
            {t("settings.sections.notifications.title")}
          </h2>
          <p
            className="text-xs sm:text-sm mb-4"
            style={{ color: colors.textSecondary }}
          >
            {t("settings.sections.notifications.description")}
          </p>

          <div>
            {settingsConfig.notifications.map((setting, index) => {
              const value =
                settings.notifications[
                  setting.key as keyof typeof settings.notifications
                ];
              return (
                <SettingRow
                  key={setting.key}
                  label={setting.label}
                  description={setting.description}
                  isLast={index === settingsConfig.notifications.length - 1}
                >
                  <ToggleButton
                    value={Boolean(value)}
                    onClick={() => handleToggle("notifications", setting.key)}
                  />
                </SettingRow>
              );
            })}
          </div>
        </section>

        {/* Privacy Section */}
        <section
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: colors.darkSecondary }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{
              fontFamily: fonts.alice,
              color: colors.text,
            }}
          >
            {t("settings.sections.privacy.title")}
          </h2>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {t("settings.sections.privacy.description")}
          </p>

          <div>
            {/* Profile Visibility */}
            <SettingRow
              label={t("settings.sections.privacy.profileVisibility")}
              description={t(
                "settings.sections.privacy.profileVisibility_desc"
              )}
            >
              <Dropdown
                type="profileVisibility"
                value={settings.privacy.profileVisibility}
                options={dropdownOptions.profileVisibility}
                onSelect={(value) =>
                  updateSetting("privacy", "profileVisibility", value)
                }
              />
            </SettingRow>

            {settingsConfig.privacy.map((setting, index) => {
              const value =
                settings.privacy[setting.key as keyof typeof settings.privacy];
              return (
                <SettingRow
                  key={setting.key}
                  label={setting.label}
                  description={setting.description}
                  isLast={index === settingsConfig.privacy.length - 1}
                >
                  <ToggleButton
                    value={Boolean(value)}
                    onClick={() => handleToggle("privacy", setting.key)}
                  />
                </SettingRow>
              );
            })}
          </div>
        </section>

        {/* Preferences Section */}
        <section
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: colors.darkSecondary }}
        >
          <h2
            className="text-xl font-semibold mb-2"
            style={{
              fontFamily: fonts.alice,
              color: colors.text,
            }}
          >
            {t("settings.sections.preferences.title")}
          </h2>
          <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>
            {t("settings.sections.preferences.description")}
          </p>

          <div>
            <SettingRow
              label={t("settings.sections.preferences.language")}
              description="Choose your preferred language"
            >
              <Dropdown
                type="language"
                value={settings.preferences.language}
                options={dropdownOptions.language}
                onSelect={(value) => {
                  updateSetting("preferences", "language", value);
                  setLanguage(value);
                }}
              />
            </SettingRow>

            <SettingRow
              label={t("settings.sections.preferences.theme")}
              description="Choose your preferred theme"
            >
              <Dropdown
                type="theme"
                value={settings.preferences.theme}
                options={dropdownOptions.theme}
                onSelect={(value) => {
                  updateSetting("preferences", "theme", value);
                  setTheme(value as "dark" | "light" | "auto");
                }}
              />
            </SettingRow>

            <SettingRow
              label={t("settings.sections.preferences.currency")}
              description="Choose your preferred currency"
              isLast={true}
            >
              <Dropdown
                type="currency"
                value={settings.preferences.currency}
                options={dropdownOptions.currency}
                onSelect={(value) =>
                  updateSetting("preferences", "currency", value)
                }
              />
            </SettingRow>
          </div>
        </section>
      </div>
    </main>
  );
}
