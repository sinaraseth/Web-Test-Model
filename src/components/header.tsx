"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModel } from "../contexts/modelContext";

export default function Header({ isMinimized }: { isMinimized: boolean }) {
  return (
    <header
      className={`fixed top-0 right-0 py-1 px-6 bg-white text-black flex items-center z-40 border-b border-gray-200 transition-all duration-300 ${
        isMinimized ? "left-20" : "left-64"
      }`}
    >
      {/* Empty header - can add content here if needed */}
    </header>
  );
}
