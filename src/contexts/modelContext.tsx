"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type ModelType =
  | "DeepSeek OCR"
  | "Qwen3VL"
  | "Paddle OCR"
  | "Gemma3"
  | "Hybrid (DeepSeek OCR + Gemma3)"
  | "Hybrid (Paddle OCR + Qwen3VL)"
  | "Granite Docling";

interface ModelContextType {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: ReactNode }) {
  const [selectedModel, setSelectedModel] = useState<ModelType>("Paddle OCR");

  return (
    <ModelContext.Provider value={{ selectedModel, setSelectedModel }}>
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
