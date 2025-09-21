import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dropdown, SettingRow, ToggleButton } from "../components/settings";
import { useAppContext } from "../context/useAppContext";
import { usePreferences } from "../hooks";
import { useClickOutside } from "../hooks/useClickOutside";

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
    currency: string;
  };
}

export default function Settings() {
  const { t } = useTranslation();
  const { settings, updateSetting } = useAppContext();
  const { setLanguage } = usePreferences();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdowns when clicking outside
  const settingsRef = useClickOutside<HTMLDivElement>(() =>
    setOpenDropdown(null)
  );

  // RTL detection - improved (based on i18n language)
  const isRTL = ["ar", "fa", "he", "ur"].includes(
    document.documentElement.lang || "en"
  );

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
    currency: [
      { value: "USD", label: "USD ($)" },
      { value: "EUR", label: "EUR (€)" },
      { value: "SAR", label: "SAR (﷼)" },
    ],
  };

  // Components moved to shared

  return (
    <main
      className="w-full max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-6 min-h-[calc(100vh-88px)]"
      ref={settingsRef}
    >
      <div className="grid gap-6 lg:gap-8">
        {/* Header */}
        <header className="grid gap-3">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold font-alice text-text">
            {t("settings.title")}
          </h1>
          <p className="text-sm sm:text-base lg:text-lg max-w-3xl text-text-secondary">
            {t("settings.subtitle")}
          </p>
        </header>

        {/* Settings Grid */}
        <div className="grid gap-4 sm:gap-6">
          {/* Notifications Section */}
          <section className="rounded-xl p-4 sm:p-6 bg-dark-secondary">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold font-alice text-text">
                  {t("settings.sections.notifications.title")}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-text-secondary">
                  {t("settings.sections.notifications.description")}
                </p>
              </div>

              <div className="grid gap-0">
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
                        onClick={() =>
                          handleToggle("notifications", setting.key)
                        }
                        isRTL={isRTL}
                      />
                    </SettingRow>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Privacy Section */}
          <section className="rounded-xl p-4 sm:p-6 bg-dark-secondary">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold font-alice text-text">
                  {t("settings.sections.privacy.title")}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-text-secondary">
                  {t("settings.sections.privacy.description")}
                </p>
              </div>

              <div className="grid gap-0">
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
                    isOpen={openDropdown === "profileVisibility"}
                    onToggle={toggleDropdown}
                  />
                </SettingRow>

                {settingsConfig.privacy.map((setting, index) => {
                  const value =
                    settings.privacy[
                      setting.key as keyof typeof settings.privacy
                    ];
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
                        isRTL={isRTL}
                      />
                    </SettingRow>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Preferences Section */}
          <section className="rounded-xl p-4 sm:p-6 bg-dark-secondary">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold font-alice text-text">
                  {t("settings.sections.preferences.title")}
                </h2>
                <p className="text-xs sm:text-sm lg:text-base text-text-secondary">
                  {t("settings.sections.preferences.description")}
                </p>
              </div>

              <div className="grid gap-0">
                <SettingRow
                  label={t("settings.sections.preferences.language")}
                  description={t("settings.sections.preferences.language_desc")}
                >
                  <Dropdown
                    type="language"
                    value={settings.preferences.language}
                    options={dropdownOptions.language}
                    onSelect={(value) => {
                      updateSetting("preferences", "language", value);
                      setLanguage(value);
                    }}
                    isOpen={openDropdown === "language"}
                    onToggle={toggleDropdown}
                  />
                </SettingRow>

                <SettingRow
                  label={t("settings.sections.preferences.currency")}
                  description={t("settings.sections.preferences.currency_desc")}
                  isLast={true}
                >
                  <Dropdown
                    type="currency"
                    value={settings.preferences.currency}
                    options={dropdownOptions.currency}
                    onSelect={(value) =>
                      updateSetting("preferences", "currency", value)
                    }
                    isOpen={openDropdown === "currency"}
                    onToggle={toggleDropdown}
                  />
                </SettingRow>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
