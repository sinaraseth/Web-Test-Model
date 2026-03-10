"use client";

import { ReactNode } from "react";
import { SidebarProvider, useSidebar } from "../contexts/sidebarContext";
import { ModelProvider } from "../contexts/modelContext";
import Sidebar from "./sidebar";
import Header from "./header";

function LayoutContent({ children }: { children: ReactNode }) {
  const { isMinimized } = useSidebar();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${
          isMinimized ? "ml-20" : "ml-64"
        }`}
      >
        <Header isMinimized={isMinimized} />
        <main className="flex-1 bg-white p-8 pt-20 pb-7 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <ModelProvider>
        <LayoutContent>{children}</LayoutContent>
      </ModelProvider>
    </SidebarProvider>
  );
}
