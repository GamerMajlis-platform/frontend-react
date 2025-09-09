import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: "Display Name",
    discordName: "Discord Name",
    bio: "Bio",
    gamingPreferences: "Gaming Preferences",
    gamingStatistics: "Gaming Statistics",
  });

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <main className="w-full min-h-[calc(100vh-88px)] flex items-center justify-center py-4 sm:py-8 px-4">
      <div className="w-full max-w-[1200px]">
        <section className="bg-[#3a506b] rounded-[20px] border border-solid border-white shadow-[2px_2px_4px_2px_#ffffff20] p-4 sm:p-6 lg:p-8">
          {/* Profile Content Grid */}
          <div className="grid gap-6 lg:gap-8">
            {/* Profile Header - Uses CSS Grid for better control */}
            <header className="grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-6 lg:gap-8 items-start lg:items-center">
              {/* Profile Picture */}
              <div className="justify-self-center lg:justify-self-start">
                <div className="w-[120px] h-[120px] sm:w-[152px] sm:h-[152px] bg-[#1c2541] rounded-full border-2 border-[#6fffe9] flex items-center justify-center">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16 text-[#808080]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>

              {/* User Info Section */}
              <div className="grid gap-4 justify-items-center lg:justify-items-start">
                {/* Names Grid */}
                <div className="grid gap-2 w-full max-w-[400px]">
                  {/* Display Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      className="w-full bg-transparent border-b border-white [font-family:'Alice-Regular',Helvetica] font-normal text-white text-xl sm:text-2xl tracking-[0] leading-[normal] focus:outline-none focus:border-[#6fffe9] text-center lg:text-left"
                      aria-label="Display name"
                    />
                  ) : (
                    <h1 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-xl sm:text-2xl tracking-[0] leading-[normal] text-center lg:text-left">
                      {profileData.displayName}
                    </h1>
                  )}

                  {/* Discord Name */}
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.discordName}
                      onChange={(e) =>
                        handleInputChange("discordName", e.target.value)
                      }
                      className="w-full bg-transparent border-b border-[#808080] [font-family:'Alice-Regular',Helvetica] font-normal text-[#808080] text-lg sm:text-xl tracking-[0] leading-[normal] focus:outline-none focus:border-[#6fffe9] text-center lg:text-left"
                      aria-label="Discord name"
                    />
                  ) : (
                    <p className="[font-family:'Alice-Regular',Helvetica] font-normal text-[#808080] text-lg sm:text-xl tracking-[0] leading-[normal] text-center lg:text-left">
                      {profileData.discordName}
                    </p>
                  )}
                </div>

                {/* Rating/Status */}
                <div className="bg-[#6fffe9] rounded-md px-4 py-2 flex items-center justify-center">
                  <span className="text-black text-xs sm:text-sm font-medium">
                    ★★★★☆ Level 5
                  </span>
                </div>

                {/* Edit Button */}
                <button
                  onClick={handleEditClick}
                  className="bg-[#d9d9d9] rounded-[20px] hover:bg-[#c0c0c0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6fffe9] px-6 py-3 flex items-center gap-3"
                  aria-label={isEditing ? t("profile.save") : t("profile.edit")}
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 26 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M2 16.5V20H5.5L16.87 8.63L13.37 5.13L2 16.5ZM19.71 6.79C20.1 6.4 20.1 5.77 19.71 5.38L17.62 3.29C17.23 2.9 16.6 2.9 16.21 3.29L14.58 4.92L18.08 8.42L19.71 6.79Z"
                      fill="black"
                    />
                  </svg>
                  <span className="[font-family:'Alice-Regular',Helvetica] font-normal text-black text-sm sm:text-lg whitespace-nowrap">
                    {isEditing ? t("profile.save") : t("profile.edit")}
                  </span>
                </button>
              </div>

              {/* Gaming Preferences Section */}
              <div className="w-full">
                <div className="bg-[#1c2541] rounded-lg p-4 sm:p-6 min-h-[120px] sm:min-h-[150px] flex items-center justify-center">
                  {isEditing ? (
                    <textarea
                      value={profileData.gamingPreferences}
                      onChange={(e) =>
                        handleInputChange("gamingPreferences", e.target.value)
                      }
                      className="w-full h-[100px] sm:h-[120px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                      placeholder="Gaming Preferences"
                      aria-label="Gaming preferences"
                    />
                  ) : (
                    <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed">
                      {profileData.gamingPreferences}
                    </h2>
                  )}
                </div>
              </div>
            </header>

            {/* Bio Section */}
            <section>
              <div className="bg-[#1c2541] rounded-lg p-4 sm:p-6 min-h-[80px] flex items-center justify-center">
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => handleInputChange("bio", e.target.value)}
                    className="w-full h-[60px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                    placeholder="Bio"
                    aria-label="Bio"
                  />
                ) : (
                  <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed">
                    {profileData.bio}
                  </h2>
                )}
              </div>
            </section>

            {/* Gaming Statistics Section */}
            <section>
              <div className="bg-[#1c2541] rounded-lg p-4 sm:p-6 lg:p-8 min-h-[150px] sm:min-h-[200px] flex items-center justify-center">
                {isEditing ? (
                  <textarea
                    value={profileData.gamingStatistics}
                    onChange={(e) =>
                      handleInputChange("gamingStatistics", e.target.value)
                    }
                    className="w-full h-[120px] sm:h-[160px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                    placeholder="Gaming Statistics"
                    aria-label="Gaming statistics"
                  />
                ) : (
                  <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-sm sm:text-lg lg:text-xl text-center tracking-[0] leading-relaxed">
                    {profileData.gamingStatistics}
                  </h2>
                )}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
