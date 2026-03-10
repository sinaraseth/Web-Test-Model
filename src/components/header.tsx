"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useModel } from "../contexts/modelContext";

export default function Header({ isMinimized }: { isMinimized: boolean }) {
  return (
    <header
      className={`fixed top-0 right-0 py-2 px-12 bg-white text-black flex justify-between items-center z-40 border-b border-gray-200 transition-all duration-300 ${
        isMinimized ? "left-20" : "left-64"
      }`}
    >
      <div className="flex items-center gap-4">
        <img
          src="/logo-company.png"
          alt="Techo Startup Center"
          className="h-12 w-auto"
        />
        <div className="h-12 w-px bg-gray-300"></div>
        <div className="flex flex-col items-start mt-2">
          <img
            src="/logo-ai.png"
            alt="AI Documentation"
            className="h-8 w-auto"
          />
          <span className="text-[10px] text-gray-600 mt-1">
            AI for Documentation
          </span>
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
