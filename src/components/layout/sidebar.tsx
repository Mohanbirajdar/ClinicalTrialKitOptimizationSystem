"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FlaskConical, MapPin, Package,
  Truck, ClipboardList, BarChart3, Bell, Activity, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trials", label: "Trials", icon: FlaskConical },
  { href: "/sites", label: "Sites", icon: MapPin },
  { href: "/inventory", label: "Kit Inventory", icon: Package },
  { href: "/shipments", label: "Shipments", icon: Truck },
  { href: "/usage", label: "Kit Usage", icon: ClipboardList },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/alerts", label: "Alerts", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebarStore();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={close}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-200",
          "md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2 min-w-0">
            <Activity className="h-6 w-6 text-sidebar-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-sidebar-foreground font-bold text-sm leading-tight truncate">ClinKit</p>
              <p className="text-sidebar-foreground/60 text-xs truncate">Trial Kit Manager</p>
            </div>
          </div>
          <button
            onClick={close}
            className="md:hidden p-1 rounded text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 mt-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={close}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
