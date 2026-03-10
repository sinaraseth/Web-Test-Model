import { ChevronUp } from "lucide-react";
import { PromptType } from "../../services/prompt.services";
import { PROMPT_OPTIONS } from "./types";

interface PromptSelectorProps {
  selectedPrompt: PromptType;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (prompt: PromptType) => void;
}

export default function PromptSelector({
  selectedPrompt,
  isOpen,
  onToggle,
  onSelect,
}: PromptSelectorProps) {
  return (
    <div className="px-3 pt-3 pb-1">
      <div className="relative">
        <button
          type="button"
          onClick={onToggle}
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
            {PROMPT_OPTIONS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => onSelect(prompt)}
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
    </div>
  );
}
