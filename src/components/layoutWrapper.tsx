"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
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
        <main className="flex-1 bg-white px-6 pt-12 pb-2 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthRoute = pathname.startsWith("/auth");

  if (isAuthRoute) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <ModelProvider>
        <LayoutContent>{children}</LayoutContent>
      </ModelProvider>
    </SidebarProvider>
  );
}
