"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModel } from "../contexts/modelContext";

export default function Header({ isMinimized }: { isMinimized: boolean }) {
  const { selectedModel, setSelectedModel } = useModel();
  const [isOpen, setIsOpen] = useState(false);

  const models = ["DeepSeek OCR", "Qwen3VL"] as const;

  return (
    <header className={`fixed top-0 right-0 py-3.5 px-12 bg-white text-black flex justify-between items-center z-40 border-b border-gray-200 transition-all duration-300 ${
      isMinimized ? "left-20" : "left-64"
    }`}>
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl">AI Documentation</div>
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <span>{selectedModel}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-40 z-50">
              {models.map((model) => (
                <button
                  key={model}
                  onClick={() => {
                    setSelectedModel(model);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    selectedModel === model ? "bg-gray-50 text-gray-600" : ""
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <nav>
        <ul className="flex gap-6 items-center">
          <li>
            <a href="/profile" className="hover:text-gray-600">
              Profile.
            </a>
          </li>
        </ul>
      </nav>
    </header>
  );
}
