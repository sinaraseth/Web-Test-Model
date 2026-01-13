"use client";

import { useSidebar } from "../contexts/sidebarContext";
import {
  PanelLeftClose,
  PanelLeftOpen,
  SquareArrowOutUpRight,
  FolderSearch,
} from "lucide-react";

export default function Sidebar() {
  const { isMinimized, setIsMinimized } = useSidebar();

  return (
    <aside
      className={`${
        isMinimized ? "w-20" : "w-64"
      } h-screen bg-gray-50 border-r border-gray-200 p-3 fixed left-0 top-0 transition-all duration-300 ease-in-out overflow-hidden`}
    >
      <div className="mb-8 flex items-center h-10">
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          className="p-2 px-4 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
          aria-label={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMinimized ? (
            <PanelLeftOpen className="w-5 h-5 min-w-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5 min-w-5" />
          )}
        </button>
        {!isMinimized && (
          <h2 className="text-xl font-bold text-gray-800 ml-2 whitespace-nowrap"></h2>
        )}
      </div>

      <nav>
        <ul className="space-y-2">
          <li>
            <a
              href="/new-chat"
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              title="New Chat"
            >
              <SquareArrowOutUpRight className="w-5 h-5 shrink-0 min-w-5" />
              {!isMinimized && <span className="ml-3 whitespace-nowrap">New Chat</span>}
            </a>
          </li>
          <li>
            <a
              href="/search-chat"
              className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
              title="Search Chat"
            >
              <FolderSearch className="w-5 h-5 shrink-0 min-w-5" />
              {!isMinimized && <span className="ml-3 whitespace-nowrap">Search Chat</span>}
            </a>
          </li>
        </ul>
      </nav>

      {/* <div className="absolute bottom-6 left-3 right-3">
        <div className="border-t border-gray-200 pt-4">
          <a
            href="/profile"
            className="flex items-center px-4 py-2 rounded-lg hover:bg-gray-200 text-gray-700 hover:text-gray-900 transition-colors"
            title="Profile"
          >
            <User className="w-5 h-5 shrink-0 min-w-5" />
            {!isMinimized && <span className="ml-3 whitespace-nowrap">Profile</span>}
          </a>
        </div>
      </div> */}
    </aside>
  );
}