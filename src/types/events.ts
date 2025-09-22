// Event Types based on the API specifications

export type EventType = "TOURNAMENT" | "COMMUNITY_GATHERING";
export type LocationType = "VIRTUAL" | "PHYSICAL" | "HYBRID";
export type EventStatus =
  | "DRAFT"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "LIVE"
  | "COMPLETED"
  | "CANCELLED";
export type AttendanceStatus =
  | "REGISTERED"
  | "CHECKED_IN"
  | "NO_SHOW"
  | "CANCELLED";
export type GameCategory =
  | "FPS"
  | "MOBA"
  | "RPG"
  | "STRATEGY"
  | "SPORTS"
  | "RACING"
  | "FIGHTING"
  | "OTHER";

export interface EventOrganizer {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface EventAttendee {
  id: number;
  user: {
    id: number;
    displayName: string;
    profilePictureUrl?: string;
  };
  status: AttendanceStatus;
  registeredAt: string;
  checkedInAt?: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  startDateTime: string;
  endDateTime?: string;
  eventType: EventType;
  locationType: LocationType;
  virtualLink?: string;
  virtualPlatform?: string;
  physicalAddress?: string;
  physicalVenue?: string;
  maxAttendees?: number;
  currentAttendees: number;
  requiresRegistration: boolean;
  registrationDeadline?: string;
  registrationRequirements?: string;
  isPublic: boolean;
  gameTitle?: string;
  gameCategory?: GameCategory;
  competitive: boolean;
  entryFee?: number;
  currency?: string;
  ageRestriction?: number;
  status: EventStatus;
  organizer: EventOrganizer;
  viewCount: number;
  interestedCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime?: string;
  eventType?: EventType;
  locationType?: LocationType;
  virtualLink?: string;
  virtualPlatform?: string;
  physicalAddress?: string;
  physicalVenue?: string;
  maxAttendees?: number;
  requiresRegistration?: boolean;
  registrationDeadline?: string;
  registrationRequirements?: string;
  isPublic?: boolean;
  gameTitle?: string;
  gameCategory?: GameCategory;
  competitive?: boolean;
  entryFee?: number;
  ageRestriction?: number;
}

export type UpdateEventRequest = Partial<CreateEventRequest>;

export interface EventFilters {
  page?: number;
  size?: number;
  eventType?: EventType;
  gameCategory?: GameCategory;
  locationType?: LocationType;
  myEvents?: boolean;
  upcoming?: boolean;
  query?: string;
}

export interface EventsListResponse {
  success: boolean;
  message: string;
  events: Event[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface EventResponse {
  success: boolean;
  message: string;
  event: Event;
}

export interface EventCreateResponse {
  success: boolean;
  message: string;
  event: Event;
}

export interface EventUpdateResponse {
  success: boolean;
  message: string;
  event: Event;
}

export interface EventDeleteResponse {
  success: boolean;
  message: string;
}

export interface EventAttendance {
  id: number;
  eventId: number;
  userId: number;
  status: AttendanceStatus;
  registeredAt: string;
  checkedInAt?: string;
}

export interface EventRegistrationResponse {
  success: boolean;
  message: string;
  attendance: EventAttendance;
}

export interface EventUnregistrationResponse {
  success: boolean;
  message: string;
}

export interface EventAttendeesResponse {
  success: boolean;
  message: string;
  attendees: EventAttendee[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface EventCheckInResponse {
  success: boolean;
  message: string;
  checkedInAt: string;
}

export interface EventSearchResponse {
  success: boolean;
  message: string;
  events: Event[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface EventTrendingResponse {
  success: boolean;
  message: string;
  events: Event[];
}

// Event form validation types
export type EventFormData = CreateEventRequest & {
  // Additional form-specific fields if needed
};

export interface EventFormErrors {
  title?: string;
  titleMinLength?: string;
  titleMaxLength?: string;
  description?: string;
  descriptionMaxLength?: string;
  startDateTime?: string;
  startDateTimeRequired?: string;
  startDateTimeFuture?: string;
  endDateTime?: string;
  endDateTimeAfterStart?: string;
  maxAttendees?: string;
  maxAttendeesPositive?: string;
  maxAttendeesMax?: string;
  registrationDeadline?: string;
  registrationDeadlineBeforeStart?: string;
  entryFee?: string;
  entryFeePositive?: string;
  entryFeeMax?: string;
  ageRestriction?: string;
  ageRestrictionRange?: string;
  virtualLink?: string;
  virtualLinkRequired?: string;
  virtualLinkValid?: string;
  physicalAddress?: string;
  physicalAddressRequired?: string;
  physicalVenue?: string;
  physicalVenueRequired?: string;
  general?: string;
}

// Event sort options
export type EventSortOption =
  | "date-soonest"
  | "date-latest"
  | "name"
  | "organizer"
  | "attendees-most"
  | "attendees-least"
  | "created-latest"
  | "created-oldest";

// Event category filter types
export type EventCategoryFilter =
  | "all"
  | "upcoming"
  | "ongoing"
  | "past"
  | "my-events";
