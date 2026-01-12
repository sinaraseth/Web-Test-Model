'use client';

import { useState } from 'react';
import { Send, Plus, FileText, ChevronUp } from 'lucide-react';
import { PromptType } from '../services/prompt.services';
import { handleFileSelection, VALID_FILE_TYPES } from '../services/images.services';

export default function ChatBox() {
  const [selectedPrompt, setSelectedPrompt] = useState<PromptType>('Parse the figure.');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const promptOptions: PromptType[] = ['Parse the figure.', 'Convert the document to markdown.', 'Describe the image to detail.', 'OCR the images.'];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    try {
      const validatedFile = handleFileSelection(file);
      setSelectedFile(validatedFile);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Invalid file type');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Handle submission logic here
    console.log('Prompt Type:', selectedPrompt);
    console.log('File:', selectedFile);

    // Reset form
    setSelectedFile(null);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 z-30" style={{ position: 'fixed' }}>
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-lg shadow-sm">
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
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 text-gray-600">
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
            disabled={!selectedFile}
            className="shrink-0 p-2 rounded-lg bg-black text-white hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            title="Send message"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}