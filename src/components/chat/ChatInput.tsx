import { useState } from "react";
import { SendHorizontal, Plus, FileText } from "lucide-react";
import { PromptType } from "../../services/prompt.services";
import PromptSelector from "./PromptSelector";
import ModelSelectorDropdown from "./ModelSelectorDropdown";
import { ModelOption } from "./types";
import { VALID_FILE_TYPES } from "../../services/images.services";

interface ChatInputProps {
  selectedFile: File | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  selectedModels: ModelOption[];
  isModelOpen: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onToggleModel: (model: ModelOption) => void;
  onSelectAllModels: () => void;
  onClearModels: () => void;
  onToggleModelDropdown: () => void;
  onSubmit: (prompt: PromptType) => void;
  isLoading: boolean;
}

export default function ChatInput({
  selectedFile,
  fileInputRef,
  selectedModels,
  isModelOpen,
  onFileChange,
  onClearFile,
  onToggleModel,
  onSelectAllModels,
  onClearModels,
  onToggleModelDropdown,
  onSubmit,
  isLoading,
}: ChatInputProps) {
  const [selectedPrompt, setSelectedPrompt] =
    useState<PromptType>("Parse the figure.");
  const [isPromptOpen, setIsPromptOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || selectedModels.length === 0) return;
    onSubmit(selectedPrompt);
  };

  const handlePromptSelect = (prompt: PromptType) => {
    setSelectedPrompt(prompt);
    setIsPromptOpen(false);
  };

  return (
    <div className="py-2 border-t">
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
                onClick={onClearFile}
                className="text-gray-500 hover:text-gray-700 shrink-0"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <PromptSelector
          selectedPrompt={selectedPrompt}
          isOpen={isPromptOpen}
          onToggle={() => setIsPromptOpen(!isPromptOpen)}
          onSelect={handlePromptSelect}
        />

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
              onChange={onFileChange}
              ref={fileInputRef}
              className="hidden"
              aria-label="Upload PDF or image file"
            />
          </label>

          <div className="flex-1"></div>

          <ModelSelectorDropdown
            selectedModels={selectedModels}
            isOpen={isModelOpen}
            onToggle={onToggleModelDropdown}
            onToggleModel={onToggleModel}
            onSelectAll={onSelectAllModels}
            onClear={onClearModels}
          />

          <button
            type="submit"
            disabled={!selectedFile || isLoading || selectedModels.length === 0}
            className="shrink-0 px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            title="Send message"
          >
            <SendHorizontal className="w-5 h-5" />
          </button>
        </div>
      </form>
      <p className="text-center text-xs text-gray-500 mt-2">
        That AI might take a bit long time to process and generate a response,
        while it run on local machine by Ollama!!!
      </p>
    </div>
  );
}
