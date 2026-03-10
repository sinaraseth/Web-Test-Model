import { ChevronUp } from "lucide-react";
import { ModelOption, MODEL_OPTIONS } from "./types";

interface ModelSelectorDropdownProps {
  selectedModels: ModelOption[];
  isOpen: boolean;
  onToggle: () => void;
  onToggleModel: (model: ModelOption) => void;
  onSelectAll: () => void;
  onClear: () => void;
}

export default function ModelSelectorDropdown({
  selectedModels,
  isOpen,
  onToggle,
  onToggleModel,
  onSelectAll,
  onClear,
}: ModelSelectorDropdownProps) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-sm border border-gray-200"
      >
        <span>
          {selectedModels.length === 0
            ? "Select Model(s)"
            : `${selectedModels.length} Model${selectedModels.length > 1 ? "s" : ""}`}
        </span>
        <ChevronUp
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-64">
          <div className="p-2 border-b border-gray-200 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">
              Select Model(s)
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1"
              >
                All
              </button>
              <button
                type="button"
                onClick={onClear}
                className="text-xs text-gray-600 hover:text-gray-700 px-2 py-1"
              >
                Clear
              </button>
            </div>
          </div>
          {MODEL_OPTIONS.map((model) => (
            <label
              key={model}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
            >
              <input
                type="checkbox"
                checked={selectedModels.includes(model)}
                onChange={() => onToggleModel(model)}
                className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
              />
              <span className="text-gray-900">{model}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
