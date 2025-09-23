import { useTranslation } from "react-i18next";
import { BackgroundDecor } from "../components";
import { PostFeed } from "../components/posts";
import { MediaGallery } from "../components/media";
import { ContentCreation } from "../components/shared/ContentCreation";
import { useAppContext } from "../context/useAppContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Image, Plus } from "lucide-react";

export default function Home() {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "create">(
    "posts"
  );
  // profile browser moved to header for authorized users

  const renderAuthenticatedContent = () => {
    return (
      <div className="w-full max-w-6xl mx-auto">
        {/* Tab Navigation */}
        <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-white/10">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === "posts"
                  ? "bg-[#6fffe9] text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <MessageSquare size={20} />
                <span>{t("home.tabs.posts")}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("media")}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === "media"
                  ? "bg-[#6fffe9] text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Image size={20} />
                <span>{t("home.tabs.media")}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("create")}
              className={`flex-1 px-6 py-3 rounded-xl transition-all duration-200 font-medium ${
                activeTab === "create"
                  ? "bg-[#6fffe9] text-black"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center justify-center space-x-2">
                <Plus size={20} />
                <span>{t("home.tabs.create")}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 min-h-[600px]">
          {activeTab === "posts" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
                <span>{t("home.content.postsTitle")}</span>
              </h2>
              <PostFeed currentUserId={user?.id} />
            </div>
          )}

          {activeTab === "media" && (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>{t("home.content.mediaTitle")}</span>
              </h2>
              <MediaGallery
                onMediaSelect={(media) => console.log("Selected media:", media)}
              />
            </div>
          )}

          {activeTab === "create" && (
            <div className="p-6">
              <ContentCreation
                onPostCreated={(postId: number) => {
                  console.log("Post created:", postId);
                  setActiveTab("posts");
                }}
                onMediaUploaded={(mediaId: number) => {
                  console.log("Media uploaded:", mediaId);
                  setActiveTab("media");
                }}
                onError={(error: string) => {
                  console.error("Content creation error:", error);
                  // TODO: Show toast notification
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUnauthenticatedContent = () => {
    return (
      <div className="w-full flex flex-col items-center">
        <h1 className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-center tracking-[0] leading-[normal] mb-3">
          {t("home.title")}
        </h1>
        <div className="w-[72px] sm:w-[100px] md:w-[121px] h-0.5 bg-[#6fffe9] mb-4"></div>
        <p className="[font-family:'Alice-Regular',Helvetica] font-normal text-white text-base sm:text-xl md:text-2xl lg:text-[28px] text-center tracking-[0] leading-[1.5] sm:leading-[1.3] md:leading-[normal] max-w-[280px] sm:max-w-[500px] md:max-w-[700px] lg:max-w-[884px] px-2 sm:px-4 md:px-0 mb-6">
          {t("home.subtitle")}
        </p>

        {/* Buttons from Figma Design - Stack on mobile, side by side on desktop */}
        <div className="flex flex-row flex-wrap items-center justify-center gap-3 sm:gap-8 md:gap-12 lg:gap-[68px] w-full max-w-[600px] mb-8">
          <button
            className="flex w-[48%] sm:w-[200px] md:w-[220px] lg:w-[245px] h-[40px] sm:h-[46px] md:h-[50px] items-center justify-center gap-2 px-5 sm:px-8 md:px-10 lg:px-12 py-2.5 bg-[#6fffe9] rounded-[30px] hover:bg-[#5ee6d3] transition-colors duration-200 cursor-pointer"
            type="button"
            aria-label={t("home.joinCommunity")}
            onClick={() => navigate("/signup")}
          >
            <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-black text-base sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap">
              {t("home.joinCommunity")}
            </span>
          </button>

          <button
            className="flex w-[48%] sm:w-[200px] md:w-[220px] lg:w-[245px] h-[40px] sm:h-[46px] md:h-[50px] items-center justify-center gap-2 px-4 sm:px-[5px] py-2.5 rounded-[30px] border border-solid border-[#6fffe9] hover:bg-[#6fffe9] transition-colors duration-200 cursor-pointer group"
            type="button"
            aria-label={t("auth.login")}
            onClick={() => navigate("/login")}
          >
            <span className="relative w-fit mt-[-0.50px] [font-family:'Alice-Regular',Helvetica] font-normal text-[#eeeeee] text-base sm:text-xl md:text-2xl text-center tracking-[0] leading-[normal] whitespace-nowrap group-hover:text-black transition-colors duration-200">
              {t("auth.login", "Login")}
            </span>
          </button>
        </div>

        {/* Profile browser demo removed — profile search now lives in the header for authorized users */}
      </div>
    );
  };

  return (
    <main className="relative w-full flex-1 flex items-center justify-center min-h-[calc(100vh-88px)] py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28">
      <BackgroundDecor />

      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28 text-center max-w-7xl relative z-10">
        {isAuthenticated
          ? renderAuthenticatedContent()
          : renderUnauthenticatedContent()}
      </div>

      {/* BackgroundDecor includes floating controller logo */}
    </main>
  );
}
