// Components exports
export {
  Header,
  Footer,
  Card,
  ChatBot,
  SortBy,
  BackgroundDecor,
} from "./shared";
export * from "./shared"; // Re-export all named exports including icons and Logo
export { default as ProfileDropdown } from "./ProfileDropdown";
export { default as PreferencesBootstrap } from "./PreferencesBootstrap";
export { ProgressBar } from "./ProgressBar";

// Profile components
export {
  ProfileSearch,
  ProfileCard,
  ProfileBrowser,
  BackendProfileHeader,
  AboutSection,
  TabBar,
} from "./profile";

// Chat components
export {
  ChatRoom,
  ChatRoomList,
  CreateRoomModal,
  MessageList,
  MessageInput,
  TypingIndicator,
  MemberList,
  OnlineUsersList,
  InviteMemberModal,
} from "./chat";

// Events components
export { CreateEventForm, EventGrid } from "./events";
