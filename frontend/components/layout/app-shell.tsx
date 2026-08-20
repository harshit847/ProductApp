"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { CommandPalette } from "../features/command-palette";

export function AppShell({ children }: PropsWithChildren) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const pathname = usePathname();

  // Close the command palette whenever the route changes.
  useEffect(() => {
    setCommandOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar pathname={pathname} onMenuClick={() => setMobileNavOpen(true)} onSearchClick={() => setCommandOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pb-12 pt-7 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
}
