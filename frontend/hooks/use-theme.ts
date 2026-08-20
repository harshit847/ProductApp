// Theme hook stores the current mode in localStorage so users keep their preference.
"use client";

import { useEffect, useState } from "react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.classList.toggle("light", theme === "light");
}

export function useTheme() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = window.localStorage.getItem("flowcrm-theme");
    const initial = stored === "dark" ? "dark" : "light";
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const updateTheme = (nextTheme: "light" | "dark") => {
    setTheme(nextTheme);
    window.localStorage.setItem("flowcrm-theme", nextTheme);
    applyTheme(nextTheme);
  };

  return { theme, setTheme: updateTheme };
}
