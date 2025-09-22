import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dropdown, SettingRow, ToggleButton } from "../components/settings";
import { useAppContext } from "../context/useAppContext";
import { usePreferences } from "../hooks/usePreferences";
import { useClickOutside } from "../hooks/useClickOutside";

interface UserSettings {
  privacy: {
    profileVisibility: "public" | "friends" | "private";
    showOnlineStatus: boolean;
  };
  preferences: {
    language: "en" | "ar";
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

  // Configuration objects - only for supported features
  const settingsConfig = {
    privacy: [
      {
        key: "profileVisibility",
        label: t("settings.sections.privacy.profileVisibility"),
        description: t("settings.sections.privacy.profileVisibility_desc"),
      },
      {
        key: "showOnlineStatus",
        label: t("settings.sections.privacy.showOnlineStatus"),
        description: t("settings.sections.privacy.showOnlineStatus_desc"),
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
  };

  return (
    <main className="min-h-screen bg-dark-primary text-text">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto" ref={settingsRef}>
          {/* Header */}
          <div className="grid gap-2 mb-6 sm:mb-8 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-alice text-text">
              {t("settings.title")}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-text-secondary">
              {t("settings.subtitle")}
            </p>
          </div>

          {/* Settings Grid */}
          <div className="grid gap-6 sm:gap-8">
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
                  {settingsConfig.privacy.map((setting, index) => {
                    const value =
                      settings.privacy?.[
                        setting.key as keyof typeof settings.privacy
                      ];

                    if (setting.key === "profileVisibility") {
                      return (
                        <SettingRow
                          key={setting.key}
                          label={setting.label}
                          description={setting.description}
                          isLast={index === settingsConfig.privacy.length - 1}
                        >
                          <Dropdown
                            type="profileVisibility"
                            value={value as string}
                            options={dropdownOptions.profileVisibility}
                            onSelect={(value) =>
                              updateSetting("privacy", setting.key, value)
                            }
                            isOpen={openDropdown === "profileVisibility"}
                            onToggle={toggleDropdown}
                          />
                        </SettingRow>
                      );
                    }

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
                    description={t(
                      "settings.sections.preferences.language_desc"
                    )}
                    isLast={true}
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
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
