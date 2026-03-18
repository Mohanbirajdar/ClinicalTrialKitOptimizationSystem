"use client";
import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSidebarStore } from "@/store/sidebar";

interface TopbarProps {
  title: string;
}

export function Topbar({ title }: TopbarProps) {
  const { open } = useSidebarStore();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={open}
          className="md:hidden p-1.5 rounded-md hover:bg-accent shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg md:text-xl font-semibold truncate">{title}</h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Link href="/alerts">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </Link>
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold shrink-0">
          A
        </div>
      </div>
    </header>
  );
}
