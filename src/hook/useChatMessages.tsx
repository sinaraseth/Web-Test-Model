import { useState, useRef, useEffect } from "react";
import {
  Message,
  createUserMessage,
  createErrorMessage,
  submitChatMessage,
} from "../services/responseChat.services";
import { PromptType } from "../services/prompt.services";
import { ModelOption } from "../components/chat/types";

export function useChatMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sqlToggles, setSqlToggles] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSqlView = (messageId: string) => {
    setSqlToggles((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  const processMessages = async (
    selectedModels: ModelOption[],
    selectedPrompt: PromptType,
    selectedFile: File,
    imageUrl: string
  ) => {
    // Add user message once
    const userMessage = createUserMessage(selectedPrompt, selectedFile, imageUrl);
    setMessages((prev) => [...prev, userMessage]);

    setIsLoading(true);

    // Process with all selected models
    for (const model of selectedModels) {
      try {
        const assistantMessage = await submitChatMessage(
          model,
          selectedPrompt,
          selectedFile
        );
        assistantMessage.modelName = model;
        assistantMessage.prompt = selectedPrompt;
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage = createErrorMessage(
          `Error: ${error instanceof Error ? error.message : "Failed to process request"}`
        );
        errorMessage.modelName = model;
        setMessages((prev) => [...prev, errorMessage]);
      }
    }

    setIsLoading(false);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return {
    messages,
    isLoading,
    sqlToggles,
    messagesEndRef,
    toggleSqlView,
    processMessages,
  };
}
