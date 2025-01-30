import { useState, useCallback } from "react";
import { nanoid } from "nanoid";

export interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export function useAIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! How can I help you with DataDAO today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      try {
        setIsLoading(true);

        // Add user message
        const userMessage: Message = {
          id: nanoid(),
          content,
          sender: "user",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);

        // Call AI API
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            history: messages.map((msg) => ({
              role: msg.sender,
              content: msg.content,
            })),
          }),
        });

        const data = await response.json();

        // Add AI response
        const aiMessage: Message = {
          id: nanoid(),
          content: data.response,
          sender: "ai",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error sending message:", error);
        // Add error message
        const errorMessage: Message = {
          id: nanoid(),
          content:
            "Sorry, I'm having trouble responding right now. Please try again later.",
          sender: "ai",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  return {
    messages,
    sendMessage,
    isLoading,
  };
}
