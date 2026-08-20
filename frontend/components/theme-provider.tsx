// A lightweight theme provider keeps the dark/light toggle self-contained.
"use client";

import { PropsWithChildren, useEffect } from "react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
}

export function ThemeProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    const stored = window.localStorage.getItem("flowcrm-theme");
    const initial = stored === "dark" ? "dark" : "light";
    applyTheme(initial);
  }, []);

  return <>{children}</>;
}
