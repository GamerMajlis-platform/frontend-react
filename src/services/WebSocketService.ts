export interface WebSocketMessage {
  type:
    | "CHAT_MESSAGE"
    | "TYPING_INDICATOR"
    | "NOTIFICATION"
    | "TOURNAMENT_UPDATE"
    | "USER_STATUS";
  roomId?: number;
  userId?: number;
  tournamentId?: number;
  message?: ChatMessage;
  user?: UserInfo;
  data?: unknown;
  isTyping?: boolean;
  timestamp?: string;
}

export interface UserInfo {
  id: number;
  displayName: string;
  profilePictureUrl?: string;
}

export interface ChatMessage {
  id: number;
  content: string;
  sender: {
    id: number;
    displayName: string;
    profilePictureUrl?: string;
  };
  timestamp: string;
  messageType?: "TEXT" | "IMAGE" | "FILE";
  attachmentUrl?: string;
}

export interface TypingIndicator {
  roomId: number;
  user: {
    id: number;
    displayName: string;
  };
  isTyping: boolean;
}

export interface NotificationMessage {
  id: number;
  type: "FRIEND_REQUEST" | "EVENT_INVITE" | "TOURNAMENT_UPDATE" | "SYSTEM";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  data?: unknown;
}

export interface WebSocketEventMap {
  connected: () => void;
  disconnected: (event: CloseEvent) => void;
  error: (error: Event) => void;
  chatMessage: (data: { roomId: number; message: ChatMessage }) => void;
  typingIndicator: (data: TypingIndicator) => void;
  notification: (data: NotificationMessage) => void;
  tournamentUpdate: (data: { tournamentId: number; data: unknown }) => void;
  userStatus: (data: { userId: number; status: unknown }) => void;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private isConnecting = false;
  private subscribedTopics = new Set<string>();
  private authToken: string | null = null;
  private eventListeners: Map<
    keyof WebSocketEventMap,
    ((...args: unknown[]) => void)[]
  > = new Map();

  constructor() {
    // Initialize event listeners map
    (
      [
        "connected",
        "disconnected",
        "error",
        "chatMessage",
        "typingIndicator",
        "notification",
        "tournamentUpdate",
        "userStatus",
      ] as const
    ).forEach((event) => {
      this.eventListeners.set(event, []);
    });
  }

  /**
   * Add event listener
   */
  on<K extends keyof WebSocketEventMap>(
    event: K,
    listener: WebSocketEventMap[K]
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener as (...args: unknown[]) => void);
    this.eventListeners.set(event, listeners);
  }

  /**
   * Remove event listener
   */
  off<K extends keyof WebSocketEventMap>(
    event: K,
    listener: WebSocketEventMap[K]
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener as (...args: unknown[]) => void);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Add event listener that runs only once
   */
  once<K extends keyof WebSocketEventMap>(
    event: K,
    listener: WebSocketEventMap[K]
  ): void {
    const onceWrapper = (...args: Parameters<WebSocketEventMap[K]>) => {
      this.off(event, onceWrapper as WebSocketEventMap[K]);
      (listener as (...args: Parameters<WebSocketEventMap[K]>) => void)(
        ...args
      );
    };
    this.on(event, onceWrapper as WebSocketEventMap[K]);
  }

  /**
   * Emit event to all listeners
   */
  private emit<K extends keyof WebSocketEventMap>(
    event: K,
    ...args: Parameters<WebSocketEventMap[K]>
  ): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach((listener) => {
      try {
        (listener as (...args: Parameters<WebSocketEventMap[K]>) => void)(
          ...args
        );
      } catch (error) {
        console.error(`Error in WebSocket event listener for ${event}:`, error);
      }
    });
  }

  /**
   * Connect to WebSocket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        // Wait for current connection attempt
        this.once("connected", resolve);
        this.once("error", reject);
        return;
      }

      this.isConnecting = true;
      this.authToken = token;

      try {
        // Connect with authorization token
        // Use explicit URL for testing per developer request
        const wsUrl = `ws://localhost:8080/api/ws?token=${encodeURIComponent(
          token
        )}`;

        // Helper to attach common handlers to a created WebSocket instance
        const attachHandlers = (
          socket: WebSocket,
          resolveP: () => void,
          rejectP: (err?: unknown) => void
        ) => {
          socket.onopen = () => {
            console.log("WebSocket connected");
            this.isConnecting = false;
            this.reconnectAttempts = 0;
            this.emit("connected");

            // Resubscribe to previous topics
            this.subscribedTopics.forEach((topic) => {
              this.subscribeToTopic(topic);
            });

            resolveP();
          };

          socket.onmessage = (event) => {
            try {
              const message: WebSocketMessage = JSON.parse(event.data);
              this.handleMessage(message);
            } catch (error) {
              console.error("Failed to parse WebSocket message:", error);
            }
          };

          socket.onclose = (event) => {
            console.log("WebSocket disconnected:", event.code, event.reason);
            this.isConnecting = false;
            this.emit("disconnected", event);

            // Attempt to reconnect unless it was a manual close
            if (
              event.code !== 1000 &&
              this.reconnectAttempts < this.maxReconnectAttempts
            ) {
              this.scheduleReconnect();
            }
          };

          socket.onerror = (error) => {
            console.error("WebSocket error:", error);
            this.isConnecting = false;
            this.emit("error", error);
            rejectP(error);
          };
        };

        // Single explicit attempt using the provided wsUrl
        try {
          if (this.ws) {
            try {
              this.ws.close();
            } catch (e) {
              console.warn("Error closing previous WebSocket instance:", e);
            }
            this.ws = null;
          }

          console.debug("Attempting WebSocket connect", { wsUrl });
          this.ws = new WebSocket(wsUrl);
          attachHandlers(
            this.ws,
            () => resolve(),
            (err) => reject(err)
          );
        } catch (err) {
          this.isConnecting = false;
          reject(err);
        }
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, "Manual disconnect");
      this.ws = null;
    }
    this.subscribedTopics.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  /**
   * Subscribe to a WebSocket topic
   */
  subscribeToTopic(topic: string): void {
    console.debug("WebSocketService.subscribeToTopic called", {
      topic,
      readyState: this.ws?.readyState,
    });
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      // Store for later subscription when connected
      console.debug("WebSocket not open yet - deferring subscription", {
        topic,
      });
      this.subscribedTopics.add(topic);

      // If we have an auth token and we're not already connecting, try to connect now
      if (this.authToken && !this.isConnecting) {
        console.debug(
          "WebSocketService: attempting reconnect to send deferred subscriptions",
          { topic }
        );
        this.connect(this.authToken).catch((err) => {
          console.error("WebSocketService: reconnect attempt failed:", err);
        });
      }

      return;
    }

    this.subscribedTopics.add(topic);
    console.debug("Sending SUBSCRIBE for topic", { topic });
    this.sendMessage({
      type: "SUBSCRIBE",
      topic,
    });
  }

  /**
   * Unsubscribe from a WebSocket topic
   */
  unsubscribeFromTopic(topic: string): void {
    console.debug("WebSocketService.unsubscribeFromTopic called", { topic });
    this.subscribedTopics.delete(topic);

    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      console.debug("Sending UNSUBSCRIBE for topic", { topic });
      this.sendMessage({
        type: "UNSUBSCRIBE",
        topic,
      });
    }
  }

  /**
   * Send a message through WebSocket
   */
  private sendMessage(message: Record<string, unknown>): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Send typing indicator
   */
  sendTypingIndicator(roomId: number, isTyping: boolean): void {
    this.sendMessage({
      type: "TYPING_INDICATOR",
      roomId,
      isTyping,
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case "CHAT_MESSAGE":
        this.emit("chatMessage", {
          roomId: message.roomId!,
          message: message.message!,
        });
        break;

      case "TYPING_INDICATOR":
        this.emit("typingIndicator", {
          roomId: message.roomId!,
          user: message.user!,
          isTyping: message.isTyping!,
        } as TypingIndicator);
        break;

      case "NOTIFICATION":
        this.emit("notification", message.data as NotificationMessage);
        break;

      case "TOURNAMENT_UPDATE":
        this.emit("tournamentUpdate", {
          tournamentId: message.tournamentId!,
          data: message.data,
        });
        break;

      case "USER_STATUS":
        this.emit("userStatus", {
          userId: message.userId!,
          status: message.data,
        });
        break;

      default:
        console.warn("Unknown WebSocket message type:", message.type);
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay =
      this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1);

    console.log(
      `Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`
    );

    setTimeout(() => {
      if (
        this.authToken &&
        this.reconnectAttempts <= this.maxReconnectAttempts
      ) {
        this.connect(this.authToken).catch(console.error);
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Get subscribed topics
   */
  get topics(): string[] {
    return Array.from(this.subscribedTopics);
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
