'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, FileText, ChevronUp, AlertCircle } from 'lucide-react';
import { PromptType } from '../services/prompt.services';
import { VALID_FILE_TYPES } from '../services/images.services';
import { useModel } from '../contexts/modelContext';
import {
  Message,
  processHtmlContent,
  validateAndSelectFile,
  createUserMessage,
  createErrorMessage,
  submitChatMessage,
} from '../services/responseChat.services';

export default function ChatBox() {
  const { selectedModel } = useModel();
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>('Parse the figure.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sqlToggles, setSqlToggles] = useState<{ [key: string]: boolean }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptOptions: PromptType[] = ['Parse the figure.', 'Convert the document to markdown.', 'Describe the image to detail.', 'OCR the images.'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleSqlView = (messageId: string) => {
    setSqlToggles(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
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
      alert(error instanceof Error ? error.message : 'Invalid file type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Check if Qwen3VL is selected
    if (selectedModel === 'Qwen3VL') {
      const errorMessage = createErrorMessage('Qwen3VL model is not available yet. Please select DeepSeek OCR or Paddle OCR instead.');
      setMessages((prev) => [...prev, errorMessage]);
      return;
    }

    // Create image preview URL
    const imageUrl = URL.createObjectURL(selectedFile);

    // Add user message
    const userMessage = createUserMessage(selectedPrompt, selectedFile, imageUrl);
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const assistantMessage = await submitChatMessage(selectedModel, selectedPrompt, selectedFile);
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage = createErrorMessage(
        `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`
      );
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-4 relative ${
                message.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900'
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
                    alt={message.file?.name || 'Uploaded image'}
                    className="rounded-lg max-w-full h-auto max-h-64 object-contain"
                  />
                </div>
              )}
              {message.htmlContent || message.sqlContent ? (
                sqlToggles[message.id] && message.sqlContent ? (
                  <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs font-mono">
                    <code>{message.sqlContent}</code>
                  </pre>
                ) : (
                  <div 
                    className="prose prose-sm max-w-none overflow-x-auto"
                    dangerouslySetInnerHTML={{ __html: processHtmlContent(message.htmlContent || '') }}
                    style={{
                      wordBreak: 'break-word',
                      whiteSpace: 'pre-wrap',
                    }}
                  />
                )
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
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
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        {selectedModel === 'Qwen3VL' && (
          <div className="mb-3 flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Qwen3VL model is not available yet. Please select DeepSeek OCR or Paddle OCR from the header.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg shadow-sm">
          {selectedFile && (
            <div className="px-4 pt-3 pb-2 border-b border-gray-200">
              <div className="inline-flex items-center gap-2 text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded max-w-md">
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700 shrink-0"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 p-3">
            <label
              htmlFor="pdf-upload"
              className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 cursor-pointer transition-colors"
              title="Upload PDF or Image"
            >
              <Plus className="w-5 h-5" />
              <input
                id="pdf-upload"
                type="file"
                accept={VALID_FILE_TYPES.join(',')}
                onChange={handleFileChange}
                className="hidden"
                aria-label="Upload PDF or image file"
              />
            </label>

            {/* Prompt Selection Dropup */}
            <div className="flex-1 relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm"
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
                        selectedPrompt === prompt ? "bg-gray-50 text-gray-600" : ""
                      }`}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={!selectedFile || isLoading}
              className="shrink-0 p-2 rounded-lg bg-black text-white hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>
      <p className="text-center text-xs text-gray-500">By Techo Startup Center</p>
    </div>
  );
}