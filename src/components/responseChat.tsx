"use client";

import { PromptType } from "../services/prompt.services";
import { useChatMessages } from "../hook/useChatMessages";
import { useModelSelection } from "../hook/useModelSelection";
import { useFileUpload } from "../hook/useFileUpload";
import ChatMessage from "./chat/ChatMessage";
import LoadingIndicator from "./chat/LoadingIndicator";
import ChatInput from "./chat/ChatInput";

export default function ChatBox() {
  // Custom hooks for state management
  const {
    messages,
    isLoading,
    sqlToggles,
    messagesEndRef,
    toggleSqlView,
    processMessages,
  } = useChatMessages();

  const {
    selectedModels,
    isModelOpen,
    toggleModelSelection,
    selectAllModels,
    clearModelSelection,
    closeModelDropdown,
    toggleModelDropdown,
  } = useModelSelection();

  const { selectedFile, fileInputRef, handleFileChange, clearFileInput } =
    useFileUpload();

  // Handle form submission
  const handleSubmit = async (selectedPrompt: PromptType) => {
    if (!selectedFile || selectedModels.length === 0) return;

    // Create image preview URL
    const imageUrl = URL.createObjectURL(selectedFile);

    // Close all dropdowns and clear file immediately
    closeModelDropdown();
    clearFileInput();

    // Process messages with selected models
    await processMessages(
      selectedModels,
      selectedPrompt,
      selectedFile,
      imageUrl
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            sqlToggles={sqlToggles}
            onToggleSqlView={toggleSqlView}
          />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Area */}
      <ChatInput
        selectedFile={selectedFile}
        fileInputRef={fileInputRef}
        selectedModels={selectedModels}
        isModelOpen={isModelOpen}
        onFileChange={handleFileChange}
        onClearFile={clearFileInput}
        onToggleModel={toggleModelSelection}
        onSelectAllModels={selectAllModels}
        onClearModels={clearModelSelection}
        onToggleModelDropdown={toggleModelDropdown}
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
}
