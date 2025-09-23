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

  // ===== EVENT MANAGEMENT ENHANCEMENTS =====

  /**
   * F21: Check if event can be modified (not past events)
   */
  static canModifyEvent(event: {
    startDateTime: string;
    status: string;
  }): boolean {
    const now = new Date();
    const eventStart = new Date(event.startDateTime);

    // Cannot modify past events or completed events
    return (
      eventStart > now &&
      event.status !== "COMPLETED" &&
      event.status !== "CANCELLED"
    );
  }

  /**
   * F20: Validate event capacity constraints
   */
  static validateEventCapacity(
    currentAttendees: number,
    maxAttendees?: number,
    newRegistrations = 1
  ): { canRegister: boolean; reason?: string } {
    if (!maxAttendees) {
      return { canRegister: true }; // No capacity limit
    }

    if (currentAttendees + newRegistrations > maxAttendees) {
      return {
        canRegister: false,
        reason: `Event capacity (${maxAttendees}) would be exceeded. Current: ${currentAttendees}`,
      };
    }

    return { canRegister: true };
  }

  /**
   * F22: Event reminder scheduling (placeholder for notification system)
   */
  static scheduleEventReminder(
    eventId: number,
    eventDateTime: string
  ): {
    reminderScheduled: boolean;
    reminderTime?: string;
  } {
    const eventTime = new Date(eventDateTime).getTime();
    const reminderTime = eventTime - 24 * 60 * 60 * 1000; // 24 hours before
    const now = Date.now();

    if (reminderTime <= now) {
      return { reminderScheduled: false }; // Too late to schedule reminder
    }

    // In a real implementation, this would:
    // 1. Schedule a background job/notification
    // 2. Store reminder in database
    // 3. Use push notifications or email service

    console.log(
      `Reminder scheduled for event ${eventId} at ${new Date(reminderTime)}`
    );

    return {
      reminderScheduled: true,
      reminderTime: new Date(reminderTime).toISOString(),
    };
  }

  /**
   * F23: Enhanced attendance tracking validation
   */
  static validateAttendanceTracking(attendanceData: {
    eventId: number;
    userId: number;
    checkInTime: string;
    eventStartTime: string;
    eventEndTime?: string;
  }): { isValid: boolean; reason?: string } {
    const checkIn = new Date(attendanceData.checkInTime);
    const eventStart = new Date(attendanceData.eventStartTime);
    const eventEnd = attendanceData.eventEndTime
      ? new Date(attendanceData.eventEndTime)
      : null;

    // Cannot check in too early (more than 1 hour before event)
    const earlyCheckInLimit = eventStart.getTime() - 60 * 60 * 1000; // 1 hour before
    if (checkIn.getTime() < earlyCheckInLimit) {
      return {
        isValid: false,
        reason:
          "Check-in is too early. Please wait until 1 hour before the event.",
      };
    }

    // Cannot check in after event has ended
    if (eventEnd && checkIn > eventEnd) {
      return {
        isValid: false,
        reason: "Cannot check in after the event has ended.",
      };
    }

    return { isValid: true };
  }

  /**
   * Enhanced registration with capacity checking
   */
  static async registerForEventWithValidation(
    eventId: number,
    event: {
      currentAttendees: number;
      maxAttendees?: number;
      startDateTime: string;
    }
  ): Promise<EventRegistrationResponse> {
    // F20: Check capacity
    const capacityCheck = this.validateEventCapacity(
      event.currentAttendees,
      event.maxAttendees
    );

    if (!capacityCheck.canRegister) {
      throw new Error(capacityCheck.reason || "Event is at capacity");
    }

    // Check if event is in the future
    const now = new Date();
    const eventStart = new Date(event.startDateTime);

    if (eventStart <= now) {
      throw new Error("Cannot register for past events");
    }

    // Proceed with normal registration
    return this.registerForEvent(eventId);
  }
}

export default EventService;
