import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Dropdown, SettingRow, ToggleButton } from "../components/settings";
import { DiscordLinkButton } from "../components/discord";
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
      {
        key: "showGamingStats",
        label: t(
          "settings.sections.privacy.showGamingStats",
          "Show Gaming Statistics"
        ),
        description: t(
          "settings.sections.privacy.showGamingStats_desc",
          "Display your gaming statistics on your profile"
        ),
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

            {/* Account Section */}
            <section className="rounded-xl p-4 sm:p-6 bg-dark-secondary">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold font-alice text-text">
                    {t("settings.sections.account.title", "Account")}
                  </h2>
                  <p className="text-xs sm:text-sm lg:text-base text-text-secondary">
                    {t(
                      "settings.sections.account.description",
                      "Manage your account details and connected services"
                    )}
                  </p>
                </div>

                <div className="grid gap-4">
                  {/* Change Email */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-text">{t("settings.sections.account.changeEmail", "Change Email")}</h3>
                          <p className="text-sm text-text-secondary">{t("settings.sections.account.changeEmail_desc", "Update your account email address")}</p>
                        </div>
                      </div>

                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const input = form.elements.namedItem("newEmail") as HTMLInputElement;
                          const email = input?.value?.trim();
                          if (!email) return;
                          try {
                            // ProfileService.UpdateProfileData doesn't include email in typings,
                            // but backend accepts email update. Cast to any to call API.
                            await (await import("../services/ProfileService")).ProfileService.updateProfile(
                              ( { email } as unknown as import("../types/auth").UpdateProfileData )
                            );
                            // refresh settings from context if needed
                            window.dispatchEvent(new CustomEvent("profile:updated"));
                            alert(t("settings.messages.emailUpdateSuccess", "Email updated successfully"));
                          } catch (err) {
                            console.error("Failed to update email:", err);
                            alert(t("settings.messages.emailUpdateFailed", "Failed to update email. Please try again later."));
                          }
                        }}
                      >
                        <div className="grid gap-2 md:grid-cols-2">
                          <input
                            name="newEmail"
                            type="email"
                            placeholder={t("settings.placeholders.newEmail", "you@example.com")}
                            className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white placeholder-slate-400"
                          />
                          <button type="submit" className="px-4 py-3 bg-cyan-500 text-white rounded-xl">{t("settings.actions.update", "Update")}</button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Change Password - backend endpoint not found in API guide; show UI but disable submission */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="grid gap-3">
                      <div>
                        <h3 className="font-semibold text-text">{t("settings.sections.account.changePassword", "Change Password")}</h3>
                        <p className="text-sm text-text-secondary">{t("settings.sections.account.changePassword_desc", "Change your account password. If this option is not available, please use password recovery.")}</p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); alert(t("settings.messages.passwordNotSupported", "Password change via frontend is not available. Use password recovery or contact support.")); }}>
                        <div className="grid gap-2 md:grid-cols-3">
                          <input name="currentPassword" type="password" placeholder={t("settings.placeholders.currentPassword", "Current password")} className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white" disabled />
                          <input name="newPassword" type="password" placeholder={t("settings.placeholders.newPassword", "New password")} className="w-full rounded-xl border border-slate-600 bg-[#0F172A] px-4 py-3 text-white" disabled />
                          <button type="submit" className="px-4 py-3 bg-gray-600 text-white rounded-xl" disabled>{t("settings.actions.change", "Change")}</button>
                        </div>
                      </form>
                    </div>
                  </div>

                  {/* Discord linking moved here */}
                  <div className="border border-gray-700 rounded-lg p-4">
                    <div className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <svg
                          className="w-6 h-6 text-[#5865F2]"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.210.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.010c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.120.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.210 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                        </svg>
                        <div>
                          <h3 className="font-semibold text-text">
                            {t("settings.sections.accounts.discord.title")}
                          </h3>
                          <p className="text-sm text-text-secondary">
                            {t(
                              "settings.sections.accounts.discord.description"
                            )}
                          </p>
                        </div>
                      </div>

                      <DiscordLinkButton
                        variant="outline"
                        size="sm"
                        onLink={(discordUser) => {
                          console.log("Discord account linked:", discordUser);
                        }}
                        onUnlink={() => {
                          console.log("Discord account unlinked");
                        }}
                        onError={(error) => {
                          console.error("Discord error:", error);
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
