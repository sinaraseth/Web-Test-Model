"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FileText, ChevronUp, X, SendHorizontal } from "lucide-react";
import { PromptType } from "../services/prompt.services";
import { VALID_FILE_TYPES } from "../services/images.services";
import { useModel } from "../contexts/modelContext";
import {
  Message,
  processHtmlContent,
  validateAndSelectFile,
  createUserMessage,
  createErrorMessage,
  submitChatMessage,
} from "../services/responseChat.services";

type ModelOption =
  | "DeepSeek OCR"
  | "Gemma3"
  | "Hybrid (DeepSeek OCR + Gemma3)"
  | "Hybrid (Paddle OCR + Qwen3VL)"
  | "Granite Docling";

export default function ChatBox() {
  const { selectedModel } = useModel();
  const [selectedPrompt, setSelectedPrompt] =
    useState<PromptType>("Parse the figure.");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [defaultModel, setDefaultModel] = useState<ModelOption>("DeepSeek OCR");
  const [sqlToggles, setSqlToggles] = useState<{ [key: string]: boolean }>({});
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [selectedModels, setSelectedModels] = useState<ModelOption[]>([
    "DeepSeek OCR",
  ]);
  const [pendingSubmit, setPendingSubmit] = useState<{
    prompt: PromptType;
    file: File;
    imageUrl: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const promptOptions: PromptType[] = [
    "Parse the figure.",
    "Convert the document to markdown.",
    "Describe the image to detail.",
    "OCR the images.",
  ];

  const modelOptions: ModelOption[] = [
    "DeepSeek OCR",
    "Gemma3",
    "Hybrid (DeepSeek OCR + Gemma3)",
    "Hybrid (Paddle OCR + Qwen3VL)",
    "Granite Docling",
  ];

  const toggleModelSelection = (model: ModelOption) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model],
    );
  };

  const selectAllModels = () => {
    setSelectedModels(modelOptions);
  };

  const clearModelSelection = () => {
    setSelectedModels([]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const toggleSqlView = (messageId: string) => {
    setSqlToggles((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      const validatedFile = validateAndSelectFile(file);
      setSelectedFile(validatedFile);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Invalid file type");
    }
  };

  const clearFileInput = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || selectedModels.length === 0) return;

    // Create image preview URL
    const imageUrl = URL.createObjectURL(selectedFile);

    // Add user message once
    const userMessage = createUserMessage(
      selectedPrompt,
      selectedFile,
      imageUrl,
    );
    setMessages((prev) => [...prev, userMessage]);

    // Close all dropdowns and clear file immediately
    setIsOpen(false);
    setIsModelOpen(false);
    clearFileInput();

    setIsLoading(true);

    // Process with all selected models
    for (const model of selectedModels) {
      try {
        const assistantMessage = await submitChatMessage(
          model,
          selectedPrompt,
          selectedFile,
        );
        assistantMessage.modelName = model;
        assistantMessage.prompt = selectedPrompt;
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage = createErrorMessage(
          `Error: ${error instanceof Error ? error.message : "Failed to process request"}`,
        );
        errorMessage.modelName = model;
        setMessages((prev) => [...prev, errorMessage]);
      }
    }

    setIsLoading(false);
  };

  const processWithSelectedModels = async () => {
    if (!pendingSubmit || selectedModels.length === 0) return;

    const { prompt, file, imageUrl } = pendingSubmit;

    // Add user message once
    const userMessage = createUserMessage(prompt, file, imageUrl);
    setMessages((prev) => [...prev, userMessage]);

    // Close modal and reset
    setShowModelSelector(false);
    setIsLoading(true);

    // Process each selected model one by one
    for (const model of selectedModels) {
      try {
        const assistantMessage = await submitChatMessage(model, prompt, file);
        // Add model name and prompt to the message
        assistantMessage.modelName = model;
        assistantMessage.prompt = prompt;
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (error) {
        const errorMessage = createErrorMessage(
          `Error: ${error instanceof Error ? error.message : "Failed to process request"}`,
        );
        errorMessage.modelName = model;
        setMessages((prev) => [...prev, errorMessage]);
      }
    }

    setIsLoading(false);
    clearFileInput();
    setPendingSubmit(null);
    setSelectedModels([]);
  };

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 relative ${
                message.type === "user"
                  ? "bg-black text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {message.sqlContent && (
                <button
                  onClick={() => toggleSqlView(message.id)}
                  className="absolute bottom-3 right-4 inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-800 text-white text-xs rounded-md hover:bg-gray-700 transition-colors z-10"
                >
                  {sqlToggles[message.id] ? (
                    <>
                      <span>HTML</span>
                    </>
                  ) : (
                    <>
                      <span>SQL</span>
                    </>
                  )}
                </button>
              )}
              {message.imageUrl && (
                <div className="mb-3">
                  <img
                    src={message.imageUrl}
                    alt={message.file?.name || "Uploaded image"}
                    className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}
              {message.htmlContent || message.sqlContent ? (
                <>
                  {message.modelName && (
                    <div className="mb-2 pb-2 border-b border-gray-300">
                      <span className="font-semibold text-sm">
                        {message.modelName}
                      </span>
                    </div>
                  )}
                  {sqlToggles[message.id] && message.sqlContent ? (
                    <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs font-mono">
                      <code>{message.sqlContent}</code>
                    </pre>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none overflow-x-auto wrap-break-word whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: processHtmlContent(
                          message.htmlContent || "",
                          message.prompt,
                        ),
                      }}
                    />
                  )}
                </>
              ) : (
                <>
                  {message.modelName && (
                    <div className="mb-2 pb-2 border-b border-gray-300">
                      <span className="font-semibold text-sm">
                        {message.modelName}
                      </span>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </>
              )}
              <span className="text-xs opacity-60 mt-2 block">
                {message.timestamp.toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Model Selection Dialog */}
      {showModelSelector && (
        <div className="mx-4 mb-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 animate-slide-up">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-900">
              Select Model(s)
            </h3>
            <button
              onClick={() => {
                setShowModelSelector(false);
                setSelectedModels([]);
              }}
              className="text-gray-400 hover:text-gray-600"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-gray-600 mb-3">
            Choose one or more models to process your image.
          </p>

          <div className="space-y-2 mb-3">
            {modelOptions.map((model) => (
              <label
                key={model}
                className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedModels.includes(model)}
                  onChange={() => toggleModelSelection(model)}
                  className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                />
                <span className="text-sm text-gray-900">{model}</span>
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={selectAllModels}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Select All
            </button>
            <button
              onClick={clearModelSelection}
              className="flex-1 px-3 py-1.5 text-xs text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={processWithSelectedModels}
              disabled={selectedModels.length === 0}
              className="flex-1 px-3 py-1.5 text-xs bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Process{" "}
              {selectedModels.length > 0 && `(${selectedModels.length})`}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-300 rounded-lg shadow-sm"
        >
          {selectedFile && (
            <div className="px-4 pt-3 pb-2 border-b border-gray-200">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded max-w-md">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={clearFileInput}
                  className="text-gray-500 hover:text-gray-700 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-1 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
              >
                <span>{selectedPrompt}</span>
                <ChevronUp
                  className={`w-4 h-4 transition-transform ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {promptOptions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => {
                        setSelectedPrompt(prompt);
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg text-sm ${
                        selectedPrompt === prompt
                          ? "bg-gray-50 text-gray-600"
                          : ""
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bottom Row - Upload, Model Selection, and Submit */}
          <div className="flex items-center gap-2 p-3">
            <label
              htmlFor="pdf-upload"
              className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors border border-gray-200"
              title="Upload PDF or Image"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Upload Image</span>
              <input
                id="pdf-upload"
                type="file"
                accept={VALID_FILE_TYPES.join(",")}
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                aria-label="Upload PDF or image file"
              />
            </label>

            <div className="flex-1"></div>

            {/* Model Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm border border-gray-200"
              >
                <span>
                  {selectedModels.length === 0
                    ? "Select Model(s)"
                    : `${selectedModels.length} Model${selectedModels.length > 1 ? "s" : ""}`}
                </span>
                <ChevronUp
                  className={`w-4 h-4 transition-transform ${
                    isModelOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isModelOpen && (
                <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
                  <div className="p-2 border-b border-gray-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-700">
                      Select Model(s)
                    </span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={selectAllModels}
                        className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={clearModelSelection}
                        className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                  {modelOptions.map((model) => (
                    <label
                      key={model}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedModels.includes(model)}
                        onChange={() => toggleModelSelection(model)}
                        className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                      />
                      <span className="text-gray-900">{model}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="shrink-0 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              title="Send message"
            >
              <SendHorizontal className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      <p className="text-center text-xs text-gray-500">
        That AI might take a bit long time to process and generate a response,
        while it run on local machine by Ollama!!!
      </p>
    </div>
  );
}
