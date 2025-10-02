import { API_CONFIG } from "../config/constants";

interface AIMessageResponse {
  id: string;
}

interface AIAnswerResponse {
  result: string;
  status: "done" | "processing";
}

interface ParsedAnswer {
  answer: string;
}

class AIService {
  private baseUrl = API_CONFIG.baseUrl.replace("/api", "");

  /**
   * Send a message to the AI chatbot
   * @param message - The user's message
   * @returns Promise with unique message ID
   */
  async sendMessage(message: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/ai/message`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const data: AIMessageResponse = await response.json();
      return data.id;
    } catch (error) {
      console.error("Failed to send message to AI", error);
      throw error;
    }
  }

  /**
   * Poll for AI response using the message ID
   * @param messageId - Unique message ID from sendMessage
   * @param maxAttempts - Maximum number of polling attempts (default: 30)
   * @param interval - Polling interval in ms (default: 1000)
   * @returns Promise with AI answer
   */
  async getAnswer(
    messageId: string,
    maxAttempts = 30,
    interval = 1000
  ): Promise<string> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(
          `${this.baseUrl}/api/ai/answer/${messageId}`,
          {
            method: "GET",
          }
        );

        if (response.ok) {
          const data: AIAnswerResponse = await response.json();

          // Check if processing is done
          if (data.status === "done") {
            // Parse the result JSON string
            try {
              const parsed: ParsedAnswer = JSON.parse(data.result);
              return parsed.answer;
            } catch (parseError) {
              console.error("Failed to parse AI response:", parseError);
              // Fallback: return raw result if parsing fails
              return data.result;
            }
          }

          // Still processing, wait and retry
          await new Promise((resolve) => setTimeout(resolve, interval));
          continue;
        }

        // If not ready yet (e.g., 202), wait and retry
        if (response.status === 202) {
          await new Promise((resolve) => setTimeout(resolve, interval));
          continue;
        }

        // Other errors
        if (response.status !== 404) {
          throw new Error(`AI answer error: ${response.status}`);
        }

        // If 404, wait and retry
        await new Promise((resolve) => setTimeout(resolve, interval));
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          console.error("Failed to get AI answer", error);
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }

    throw new Error("AI response timeout - max attempts reached");
  }

  /**
   * Send message and wait for response (convenience method)
   * @param message - The user's message
   * @returns Promise with AI answer
   */
  async chat(message: string): Promise<string> {
    const messageId = await this.sendMessage(message);
    return await this.getAnswer(messageId);
  }
}

export default new AIService();
