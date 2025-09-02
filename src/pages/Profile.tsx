import { useState } from "react";

export default function Profile() {
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
      <div className="w-full max-w-[1168px] min-h-[500px] sm:min-h-[576px]">
        <div className="relative w-full h-full">
          <section className="relative w-full min-h-[500px] sm:min-h-[578px] bg-[#3a506b] rounded-[20px] border border-solid border-white shadow-[2px_2px_4px_2px_#ffffff20]">
            <div className="relative w-full px-4 sm:px-6 md:px-7 py-6 sm:py-[43px]">
              <div className="relative min-h-[400px] sm:min-h-[488px]">
                {/* Profile Header Section */}
                <header className="flex flex-col lg:flex-row lg:items-center lg:justify-center gap-4 lg:gap-[37px] mb-6 sm:mb-[89px]">
                  {/* Profile Picture Placeholder */}
                  <div className="flex justify-center lg:justify-start">
                    <div className="relative w-[120px] h-[120px] sm:w-[152px] sm:h-[152px] aspect-square bg-[#1c2541] rounded-full border-2 border-[#6fffe9] flex items-center justify-center">
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

                  {/* User Info and Edit Button Section */}
                  <div className="relative w-full lg:w-[444px] min-h-[180px] sm:min-h-[201px]">
                    {/* User Info Container */}
                    <div className="absolute w-full max-w-[440px] h-[60px] sm:h-[73px] top-0 left-0 lg:left-auto">
                      {/* Display Name */}
                      <div className="absolute w-full max-w-[345px] top-[11px] left-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.displayName}
                            onChange={(e) =>
                              handleInputChange("displayName", e.target.value)
                            }
                            className="w-full bg-transparent border-b border-white [font-family:'Alice-Regular',Helvetica] font-normal text-white text-xl sm:text-2xl tracking-[0] leading-[normal] focus:outline-none focus:border-[#6fffe9]"
                            aria-label="Display name"
                          />
                        ) : (
                          <h1 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-xl sm:text-2xl tracking-[0] leading-[normal]">
                            {profileData.displayName}
                          </h1>
                        )}
                      </div>

                      {/* Discord Name */}
                      <div className="absolute w-full max-w-[291px] top-[40px] sm:top-[50px] left-0">
                        {isEditing ? (
                          <input
                            type="text"
                            value={profileData.discordName}
                            onChange={(e) =>
                              handleInputChange("discordName", e.target.value)
                            }
                            className="w-full bg-transparent border-b border-[#808080] [font-family:'Alice-Regular',Helvetica] font-normal text-[#808080] text-lg sm:text-xl tracking-[0] leading-[normal] focus:outline-none focus:border-[#6fffe9]"
                            aria-label="Discord name"
                          />
                        ) : (
                          <p className="[font-family:'Alice-Regular',Helvetica] font-normal text-[#808080] text-lg sm:text-xl tracking-[0] leading-[normal]">
                            {profileData.discordName}
                          </p>
                        )}
                      </div>

                      {/* Edit Button */}
                      <div className="absolute w-[180px] sm:w-[196px] h-[50px] sm:h-[62px] top-[20px] right-0 sm:left-[244px] rounded-[20px]">
                        <button
                          onClick={handleEditClick}
                          className="relative w-[180px] sm:w-[190px] h-[50px] sm:h-[62px] bg-[#d9d9d9] rounded-[20px] hover:bg-[#c0c0c0] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#6fffe9]"
                          aria-label={
                            isEditing ? "Save profile changes" : "Edit profile"
                          }
                        >
                          <span className="absolute top-[14px] sm:top-[17px] left-[50px] sm:left-[60px] [font-family:'Alice-Regular',Helvetica] font-normal text-black text-lg sm:text-[22px] tracking-[0] leading-[normal] whitespace-nowrap">
                            {isEditing ? "Save Profile" : "Edit Profile"}
                          </span>

                          {/* Edit Icon */}
                          <svg
                            className="absolute w-[22px] sm:w-[26px] h-[18px] sm:h-[22px] top-[16px] sm:top-[19px] left-4 sm:left-5"
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
                        </button>
                      </div>
                    </div>

                    {/* Rating/Status Frame */}
                    <div className="absolute w-[140px] sm:w-[164px] h-[26px] sm:h-[31px] top-[65px] sm:top-[78px] left-1/2 transform -translate-x-1/2 lg:left-[122px] lg:transform-none bg-[#6fffe9] rounded-md flex items-center justify-center">
                      <span className="text-black text-xs sm:text-sm font-medium">
                        ★★★★☆ Level 5
                      </span>
                    </div>

                    {/* Bio Section */}
                    <div className="absolute w-full max-w-[442px] h-[65px] sm:h-[78px] top-[100px] sm:top-[123px] left-0">
                      <div className="relative w-full max-w-[440px] h-[65px] sm:h-[78px]">
                        <div className="absolute w-full h-[63px] sm:h-[76px] top-[1px] sm:top-0.5 left-0 bg-[#1c2541]" />

                        <div className="absolute w-full h-[65px] sm:h-[78px] top-0 left-0 flex items-center justify-center">
                          {isEditing ? (
                            <textarea
                              value={profileData.bio}
                              onChange={(e) =>
                                handleInputChange("bio", e.target.value)
                              }
                              className="w-[90%] h-[50px] sm:h-[60px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal] focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                              placeholder="Bio"
                              aria-label="Bio"
                            />
                          ) : (
                            <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal]">
                              {profileData.bio}
                            </h2>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gaming Preferences Section */}
                  <div className="relative w-full lg:w-[448px] min-h-[180px] sm:min-h-[202px] lg:mr-[-2px]">
                    <div className="relative w-full max-w-[446px] h-[180px] sm:h-[202px]">
                      <div className="w-full h-[175px] sm:h-[197px] top-[5px] absolute left-0 bg-[#1c2541]" />

                      <div className="w-full h-[180px] sm:h-[202px] absolute top-0 left-0 flex items-center justify-center">
                        {isEditing ? (
                          <textarea
                            value={profileData.gamingPreferences}
                            onChange={(e) =>
                              handleInputChange(
                                "gamingPreferences",
                                e.target.value
                              )
                            }
                            className="w-[90%] h-[160px] sm:h-[180px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal] focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                            placeholder="Gaming Preferences"
                            aria-label="Gaming preferences"
                          />
                        ) : (
                          <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal]">
                            {profileData.gamingPreferences}
                          </h2>
                        )}
                      </div>
                    </div>
                  </div>
                </header>

                {/* Gaming Statistics Section */}
                <section className="absolute w-full max-w-[1114px] h-[200px] sm:h-[239px] top-[420px] sm:top-[249px] left-0">
                  <div className="relative w-full max-w-[1112px] h-[200px] sm:h-[239px]">
                    <div className="w-full h-[194px] sm:h-[233px] top-[3px] sm:top-1.5 absolute left-0 bg-[#1c2541]" />

                    <div className="w-full h-[200px] sm:h-[239px] absolute top-0 left-0 flex items-center justify-center">
                      {isEditing ? (
                        <textarea
                          value={profileData.gamingStatistics}
                          onChange={(e) =>
                            handleInputChange(
                              "gamingStatistics",
                              e.target.value
                            )
                          }
                          className="w-[95%] h-[180px] sm:h-[220px] bg-transparent resize-none [font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal] focus:outline-none focus:ring-1 focus:ring-[#6fffe9] rounded"
                          placeholder="Gaming Statistics"
                          aria-label="Gaming statistics"
                        />
                      ) : (
                        <h2 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-lg sm:text-2xl text-center tracking-[0] leading-[normal]">
                          {profileData.gamingStatistics}
                        </h2>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
