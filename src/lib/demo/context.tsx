"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface DemoContextType {
  isDemo: boolean;
  enterDemo: () => void;
  exitDemo: () => void;
}

const DemoContext = createContext<DemoContextType>({
  isDemo: false,
  enterDemo: () => {},
  exitDemo: () => {},
});

export function DemoProvider({ children }: { children: ReactNode }) {
  const [isDemo, setIsDemo] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("flash_master_demo") === "true";
  });

  const enterDemo = useCallback(() => {
    localStorage.setItem("flash_master_demo", "true");
    setIsDemo(true);
  }, []);

  const exitDemo = useCallback(() => {
    localStorage.removeItem("flash_master_demo");
    setIsDemo(false);
  }, []);

  return (
    <DemoContext.Provider value={{ isDemo, enterDemo, exitDemo }}>
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  return useContext(DemoContext);
}

export function isDemoMode() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("flash_master_demo") === "true";
}
