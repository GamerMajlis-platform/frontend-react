import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAppContext } from "../context/AppContext";
import usePreferences from "../hooks/usePreferences";
import {
  colors,
  fonts,
  transitions,
  baseContainer,
} from "../styles/BaseStyles";
import type { CSSProperties } from "react";

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

  // Unified styles object - reduces repetition
  const styles = {
    main: {
      ...baseContainer,
      minHeight: "calc(100vh - 88px)",
      paddingTop: "24px",
      paddingBottom: "24px",
    } as CSSProperties,

    header: { marginBottom: "32px" } as CSSProperties,

    title: {
      fontFamily: fonts.alice,
      fontWeight: "600",
      color: colors.text,
      fontSize: "24px",
      marginBottom: "8px",
    } as CSSProperties,

    subtitle: {
      color: colors.textSecondary,
      fontSize: "16px",
      marginBottom: "32px",
    } as CSSProperties,

    section: {
      backgroundColor: colors.darkSecondary,
      borderRadius: "12px",
      padding: "24px",
      marginBottom: "24px",
    } as CSSProperties,

    sectionTitle: {
      fontFamily: fonts.alice,
      fontSize: "20px",
      fontWeight: "600",
      color: colors.text,
      marginBottom: "8px",
    } as CSSProperties,

    description: {
      color: colors.textSecondary,
      fontSize: "14px",
      marginBottom: "16px",
    } as CSSProperties,

    settingItem: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "16px 0",
      borderBottom: `1px solid ${colors.textMuted}`,
    } as CSSProperties,

    label: {
      color: colors.text,
      fontWeight: "500",
      marginBottom: "4px",
    } as CSSProperties,

    dropdown: {
      container: { position: "relative" } as CSSProperties,
      button: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 12px",
        backgroundColor: colors.darkSecondary,
        border: `1px solid ${colors.textMuted}`,
        borderRadius: "6px",
        color: colors.text,
        cursor: "pointer",
        minWidth: "120px",
        fontSize: "14px",
        transition: transitions.fast,
      } as CSSProperties,
      menu: {
        position: "absolute",
        top: "calc(100% + 4px)",
        right: "0",
        backgroundColor: colors.darkSecondary,
        border: `1px solid ${colors.textMuted}`,
        borderRadius: "6px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
        minWidth: "120px",
      } as CSSProperties,
      item: {
        display: "block",
        width: "100%",
        padding: "8px 12px",
        backgroundColor: "transparent",
        border: "none",
        color: colors.text,
        textAlign: "left",
        cursor: "pointer",
        fontSize: "14px",
        transition: transitions.fast,
      } as CSSProperties,
    },
  };

  const getToggleStyles = (isActive: boolean) => ({
    button: {
      width: "48px",
      height: "24px",
      backgroundColor: isActive ? colors.primary : colors.textMuted,
      borderRadius: "12px",
      border: "none",
      cursor: "pointer",
      position: "relative",
      transition: transitions.normal,
      direction: isRTL ? "rtl" : "ltr",
    } as CSSProperties,

    switch: {
      width: "20px",
      height: "20px",
      backgroundColor: "white",
      borderRadius: "50%",
      position: "absolute",
      top: "2px",
      left: isRTL ? (isActive ? "2px" : "26px") : isActive ? "26px" : "2px",
      transition: transitions.normal,
    } as CSSProperties,
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
      <button style={toggleStyles.button} onClick={onClick}>
        <div style={toggleStyles.switch} />
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
    <div style={styles.dropdown.container}>
      <button
        style={styles.dropdown.button}
        onClick={() => toggleDropdown(type)}
      >
        {options.find((opt) => opt.value === value)?.label || value}
        <svg
          style={{
            width: "16px",
            height: "16px",
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
        <div style={styles.dropdown.menu}>
          {options.map((option) => (
            <button
              key={option.value}
              style={styles.dropdown.item}
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
      style={{
        ...styles.settingItem,
        borderBottom: isLast ? "none" : styles.settingItem.borderBottom,
      }}
    >
      <div>
        <div style={styles.label}>{label}</div>
        <div style={styles.description}>{description}</div>
      </div>
      {children}
    </div>
  );

  return (
    <main style={styles.main}>
      <div style={{ width: "100%" }}>
        {/* Header */}
        <header style={styles.header}>
          <h1 style={styles.title}>{t("settings.title")}</h1>
          <p style={styles.subtitle}>{t("settings.subtitle")}</p>
        </header>

        {/* Notifications Section */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {t("settings.sections.notifications.title")}
          </h2>
          <p style={styles.description}>
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
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {t("settings.sections.privacy.title")}
          </h2>
          <p style={styles.description}>
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
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {t("settings.sections.preferences.title")}
          </h2>
          <p style={styles.description}>
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
