'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Plus, FileText, ChevronUp } from 'lucide-react';
import { PromptType } from '../services/prompt.services';
import { handleFileSelection, VALID_FILE_TYPES } from '../services/images.services';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  htmlContent?: string;
  file?: {
    name: string;
    type: string;
  };
  timestamp: Date;
}

export default function ChatBox() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>('Parse the figure.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const promptOptions: PromptType[] = ['Parse the figure.', 'Convert the document to markdown.', 'Describe the image to detail.', 'OCR the images.'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processHtmlContent = (html: string) => {
    // Replace \n with <br> tags for proper line breaks
    return html.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      const validatedFile = handleFileSelection(file);
      setSelectedFile(validatedFile);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid file type');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: selectedPrompt,
      file: {
        name: selectedFile.name,
        type: selectedFile.type,
      },
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call Next.js API route (which proxies to Flask)
      const formData = new FormData();
      formData.append('prompt', `<image>\n${selectedPrompt}`);
      formData.append('image', selectedFile);

      const response = await fetch('/api/deepSeekOCR', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Extract HTML content from response
      let htmlContent = data.response;
      
      // If response contains {"html":"..."}, extract just the HTML
      if (typeof htmlContent === 'string' && htmlContent.includes('{"html":"')) {
        try {
          const parsed = JSON.parse(htmlContent);
          htmlContent = parsed.html;
        } catch {
          // If parsing fails, try regex extraction
          const match = htmlContent.match(/\{"html":"(.*)"\}/);
          if (match) {
            htmlContent = match[1];
          }
        }
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: '',
        htmlContent: htmlContent,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
        timestamp: new Date(),
      };
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
              className={`max-w-[70%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              {message.file && (
                <div className="flex items-center gap-2 mb-2 text-sm opacity-80">
                  <FileText className="w-4 h-4" />
                  <span className="truncate">{message.file.name}</span>
                </div>
              )}
              {message.htmlContent ? (
                <div 
                  className="prose prose-sm max-w-none overflow-x-auto"
                  dangerouslySetInnerHTML={{ __html: processHtmlContent(message.htmlContent) }}
                  style={{
                    wordBreak: 'break-word',
                    whiteSpace: 'pre-wrap',
                  }}
                />
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
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg text-sm ${
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
    </div>
  );
}