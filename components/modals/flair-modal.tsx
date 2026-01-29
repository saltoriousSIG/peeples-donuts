"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { FlairInventory } from "@/components/pins/flair-inventory";
import { FlairFusion } from "@/components/pins/flair-fusion";
import { FlairShop } from "@/components/pins/flair-shop";
import { useFlair } from "@/hooks/useFlair";

interface FlairModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSection?: string;
}

export function FlairModal({ isOpen, onClose, initialSection = "collection" }: FlairModalProps) {
  const [activeSection, setActiveSection] = useState<string>(initialSection);
  const { ownedFlair } = useFlair();

  // Check if user has any flair that can be fused (2+ of same type)
  const canFuse = ownedFlair.some(flair => {
    const sameType = ownedFlair.filter(f => f.gauge === flair.gauge && f.rarity === flair.rarity);
    return sameType.length >= 2;
  });

  const sections = [
    { id: "collection", label: "Collection", icon: "🎭" },
    { id: "shop", label: "Shop", icon: "🛒" },
    { id: "fusion", label: "Fusion", icon: "⚗️", badge: canFuse },
  ];

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset to initial section when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSection(initialSection);
    }
  }, [isOpen, initialSection]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "fixed inset-x-0 bottom-0 z-50",
          "bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8]",
          "rounded-t-3xl shadow-2xl",
          "animate-in slide-in-from-bottom duration-300",
          "max-h-[85vh] overflow-hidden flex flex-col"
        )}
        style={{
          paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 16px)",
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2 flex-shrink-0">
          <div className="w-12 h-1 rounded-full bg-[#D4915D]/30" />
        </div>

        {/* Header with tabs */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold transition-all",
                  activeSection === section.id
                    ? "bg-[#3D2914] text-[#FAF0DC]"
                    : "text-[#5C4A3D] hover:bg-[#D4915D]/10"
                )}
              >
                <span>{section.icon}</span>
                <span>{section.label}</span>
                {section.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E85A71]" />
                )}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#D4915D]/10 flex items-center justify-center text-[#5C4A3D] hover:bg-[#D4915D]/20 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {activeSection === "collection" && (
            <div className="animate-scale-in">
              <FlairInventory />
            </div>
          )}

          {activeSection === "shop" && (
            <div className="animate-scale-in">
              <FlairShop />
            </div>
          )}

          {activeSection === "fusion" && (
            <div className="animate-scale-in">
              <FlairFusion />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
