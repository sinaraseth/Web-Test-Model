"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModel } from "../contexts/modelContext";

export default function Header({ isMinimized }: { isMinimized: boolean }) {
  return (
    <header className={`fixed top-0 right-0 py-3.5 px-12 bg-white text-black flex justify-between items-center z-40 border-b border-gray-200 transition-all duration-300 ${
      isMinimized ? "left-20" : "left-64"
    }`}>
      <div className="flex items-center gap-4">
        <div className="font-bold text-xl">AI Documentation</div>
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
