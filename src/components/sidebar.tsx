"use client";

import { useSidebar } from "../contexts/sidebarContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquareArrowOutUpRight,
  FolderSearch,
  CircleUser,
} from "lucide-react";

export default function Sidebar() {
  const { isMinimized, setIsMinimized } = useSidebar();

  return (
    <aside
      className={`${
        isMinimized ? "w-20" : "w-64"
      } h-screen bg-gray-50 border-r border-gray-200 p-3 fixed left-0 top-0 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      {/* Header Area */}
      {isMinimized ? (
        <div className="mb-8 flex items-center justify-center h-16 relative group">
          {/* AI Logo - visible by default */}
          <div className="flex flex-col items-center group-hover:opacity-0 transition-opacity">
            <img
              src="/logo-ai.png"
              alt="AI Documentation"
              className="h-6 w-auto"
            />
          </div>
          {/* Collapse button - shows on hover */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-700"
            aria-label="Expand sidebar"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="mb-8 flex items-center h-16 gap-3">
          {/* Logos on left */}
          <div className="flex items-center gap-3 flex-1">
            <img
              src="/logo-company.png"
              alt="Techo Startup Center"
              className="h-11 w-auto"
            />
            <div className="h-12 w-px bg-gray-300"></div>
            <div className="flex flex-col items-start justify-center">
              <img
                src="/logo-ai.png"
                alt="AI Documentation"
                className="h-7 w-auto"
              />
              <span className="text-[8px] text-gray-600 mt-1 whitespace-nowrap">
                AI for Documentation
              </span>
            </div>
          </div>
          {/* Collapse button on right */}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors shrink-0"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>
      )}

      <nav>
        <ul className="space-y-2">
          <li>
            <a
              href="/new-chat"
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              title="New Chat"
            >
              <SquareArrowOutUpRight className="w-5 h-5 shrink-0 min-w-5" />
              {!isMinimized && (
                <span className="ml-3 whitespace-nowrap">New Chat</span>
              )}
            </a>
          </li>
          <li>
            <a
              href="/search-chat"
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              title="Search Chat"
            >
              <FolderSearch className="w-5 h-5 shrink-0 min-w-5" />
              {!isMinimized && (
                <span className="ml-3 whitespace-nowrap">Search Chat</span>
              )}
            </a>
          </li>
        </ul>
      </nav>

      <div className="absolute bottom-6 left-3 right-3">
        <div className="border-t border-gray-200 pt-4">
          <a
            href="/profile"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
            title="Profile"
          >
            <CircleUser className="w-5 h-5 shrink-0 min-w-5" />
            {!isMinimized && (
              <span className="ml-3 whitespace-nowrap">Profile</span>
            )}
          </a>
        </div>
      </div>
    </aside>
  );
}
