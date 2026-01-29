"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Info, Droplets, Gavel, Sparkles, LucideIcon } from "lucide-react";

type NavItem = {
  href: "/" | "/pool" | "/pins" | "/auction" | "/about";
  icon: LucideIcon | null;
  label: string;
  isDonut?: boolean;
};

export function NavBar() {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    { href: "/pool", icon: Droplets, label: "Pool" },
    { href: "/pins", icon: Sparkles, label: "Flair" },
    { href: "/", icon: null, label: "Home", isDonut: true },
    { href: "/auction", icon: Gavel, label: "Auction" },
    { href: "/about", icon: Info, label: "About" },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
        paddingTop: "12px",
      }}
    >
      {/* Warm bakery background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF0DC]/98 via-[#FDF6E3]/95 to-transparent backdrop-blur-xl" />

      {/* Top border - warm maple glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#D4915D]/25 to-transparent" />

      <div className="relative flex justify-around items-center max-w-[520px] mx-auto px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isDonut) {
            // Special center donut button
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -mt-4"
              >
                <div className={cn(
                  "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300",
                  "shadow-lg hover:shadow-xl hover:scale-105",
                  isActive
                    ? "bg-gradient-to-br from-[#E85A71] to-[#C94A5C] ring-4 ring-[#E85A71]/25"
                    : "bg-gradient-to-br from-[#FDF6E3] to-[#FAF0DC] ring-2 ring-[#D4915D]/20"
                )}>
                  {/* Inner donut hole */}
                  <div className={cn(
                    "w-5 h-5 rounded-full transition-colors",
                    isActive ? "bg-white/90" : "bg-[#3D2914]/10"
                  )} />

                  {/* Decorative sprinkle */}
                  {isActive && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#F4A627] animate-bounce" />
                  )}
                </div>
                <span className={cn(
                  "absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold transition-colors whitespace-nowrap",
                  isActive ? "text-[#C94A5C]" : "text-[#8B7355]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          }

          const Icon = item.icon!;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 transition-all duration-200 group"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                isActive
                  ? "bg-[#D4915D]/15 shadow-sm"
                  : "group-hover:bg-[#D4915D]/10"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive
                    ? "text-[#C67B30]"
                    : "text-[#8B7355] group-hover:text-[#5C4332]"
                )} />
              </div>
              <span className={cn(
                "text-[9px] font-bold mt-0.5 transition-colors",
                isActive ? "text-[#C67B30]" : "text-[#8B7355]"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
