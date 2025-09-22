import { apiFetch, createFormData } from "../lib/api";
import { API_ENDPOINTS } from "../config/constants";
import type {
  EventFilters,
  CreateEventRequest,
  UpdateEventRequest,
  EventsListResponse,
  EventResponse,
  EventCreateResponse,
  EventUpdateResponse,
  EventDeleteResponse,
  EventRegistrationResponse,
  EventUnregistrationResponse,
  EventAttendeesResponse,
  EventCheckInResponse,
  EventSearchResponse,
  EventTrendingResponse,
} from "../types/events";

class EventService {
  // Get Events List - API: GET /api/events
  static async listEvents(
    filters: EventFilters = {}
  ): Promise<EventsListResponse> {
    const params = new URLSearchParams();

    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.eventType) params.append("eventType", filters.eventType);
    if (filters.gameCategory)
      params.append("gameCategory", filters.gameCategory);
    if (filters.locationType)
      params.append("locationType", filters.locationType);
    if (filters.myEvents !== undefined)
      params.append("myEvents", filters.myEvents.toString());
    if (filters.upcoming !== undefined)
      params.append("upcoming", filters.upcoming.toString());

    const queryString = params.toString();
    const url = queryString
      ? `${API_ENDPOINTS.events}?${queryString}`
      : API_ENDPOINTS.events;

    return await apiFetch(url);
  }

  // Get Event Details - API: GET /api/events/{eventId}
  static async getEvent(eventId: number): Promise<EventResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}`);
  }

  // Create Event - API: POST /api/events
  static async createEvent(
    data: CreateEventRequest
  ): Promise<EventCreateResponse> {
    const prepared: Record<string, string | Blob> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value && typeof value === "object" && "stream" in value) {
        prepared[key] = value as Blob;
      } else if (typeof value === "boolean" || typeof value === "number") {
        prepared[key] = value.toString();
      } else {
        prepared[key] = String(value);
      }
    });

    const formData = createFormData(prepared);
    return await apiFetch(API_ENDPOINTS.events, {
      method: "POST",
      body: formData,
    });
  }

  // Update Event - API: PUT /api/events/{eventId}
  static async updateEvent(
    eventId: number,
    data: UpdateEventRequest
  ): Promise<EventUpdateResponse> {
    const prepared: Record<string, string | Blob> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (value && typeof value === "object" && "stream" in value) {
        prepared[key] = value as Blob;
      } else if (typeof value === "boolean" || typeof value === "number") {
        prepared[key] = value.toString();
      } else {
        prepared[key] = String(value);
      }
    });

    const formData = createFormData(prepared);
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}`, {
      method: "PUT",
      body: formData,
    });
  }

  // Delete Event - API: DELETE /api/events/{eventId}
  static async deleteEvent(eventId: number): Promise<EventDeleteResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}`, {
      method: "DELETE",
    });
  }

  // Register for Event - API: POST /api/events/{eventId}/register
  static async registerForEvent(
    eventId: number
  ): Promise<EventRegistrationResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}/register`, {
      method: "POST",
    });
  }

  // Unregister from Event - API: POST /api/events/{eventId}/unregister
  static async unregisterFromEvent(
    eventId: number
  ): Promise<EventUnregistrationResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}/unregister`, {
      method: "POST",
    });
  }

  // Get Event Attendees - API: GET /api/events/{eventId}/attendees
  static async getEventAttendees(
    eventId: number,
    page = 0,
    size = 20
  ): Promise<EventAttendeesResponse> {
    return await apiFetch(
      `${API_ENDPOINTS.events}/${eventId}/attendees?page=${page}&size=${size}`
    );
  }

  // Check-in to Event - API: POST /api/events/{eventId}/check-in
  static async checkInToEvent(eventId: number): Promise<EventCheckInResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/${eventId}/check-in`, {
      method: "POST",
    });
  }

  // Search Events - API: GET /api/events/search
  static async searchEvents(
    query: string,
    filters: Omit<EventFilters, "query"> = {}
  ): Promise<EventSearchResponse> {
    const params = new URLSearchParams();
    params.append("query", query);

    if (filters.page !== undefined)
      params.append("page", filters.page.toString());
    if (filters.size !== undefined)
      params.append("size", filters.size.toString());
    if (filters.eventType) params.append("eventType", filters.eventType);
    if (filters.locationType)
      params.append("locationType", filters.locationType);

    return await apiFetch(
      `${API_ENDPOINTS.events}/search?${params.toString()}`
    );
  }

  // Get Trending Events - API: GET /api/events/trending
  static async getTrendingEvents(limit = 10): Promise<EventTrendingResponse> {
    return await apiFetch(`${API_ENDPOINTS.events}/trending?limit=${limit}`);
  }
}

export default EventService;
