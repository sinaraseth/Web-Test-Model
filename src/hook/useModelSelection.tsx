import { useState } from "react";
import { ModelOption, MODEL_OPTIONS } from "../components/chat/types";

export function useModelSelection() {
  const [selectedModels, setSelectedModels] = useState<ModelOption[]>([
    "DeepSeek OCR",
  ]);
  const [isModelOpen, setIsModelOpen] = useState(false);

  const toggleModelSelection = (model: ModelOption) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const selectAllModels = () => {
    setSelectedModels(MODEL_OPTIONS);
  };

  const clearModelSelection = () => {
    setSelectedModels([]);
  };

  const closeModelDropdown = () => {
    setIsModelOpen(false);
  };

  const toggleModelDropdown = () => {
    setIsModelOpen(!isModelOpen);
  };

  return {
    selectedModels,
    isModelOpen,
    toggleModelSelection,
    selectAllModels,
    clearModelSelection,
    closeModelDropdown,
    toggleModelDropdown,
  };
}
