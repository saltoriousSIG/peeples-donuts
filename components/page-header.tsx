"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ReactNode } from "react";

export type MiniAppContext = {
  user?: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  };
};

interface PageHeaderProps {
  title: string;
  subtitle: string;
  titleExtra?: ReactNode;
  context: MiniAppContext | null;
}

const initialsFrom = (label?: string) => {
  if (!label) return "";
  const stripped = label.replace(/[^a-zA-Z0-9]/g, "");
  if (!stripped) return label.slice(0, 2).toUpperCase();
  return stripped.slice(0, 2).toUpperCase();
};

export function PageHeader({
  title,
  subtitle,
  titleExtra,
  context,
}: PageHeaderProps) {
  const userDisplayName =
    context?.user?.displayName ?? context?.user?.username ?? "Farcaster user";
  const userHandle = context?.user?.username
    ? `@${context.user.username}`
    : context?.user?.fid
      ? `fid ${context.user.fid}`
      : "";
  const userAvatarUrl = context?.user?.pfpUrl ?? null;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {/* Consistent Mr. Peeples Logo - same on every page */}
        <div className="relative">
          <div className="w-14 h-14 donut-ring">
            <div className="donut-ring-inner">
              <img
                src="/media/peeples_donuts.png"
                className="w-auto h-18"
                alt="Mr. Peeples"
              />
            </div>
          </div>
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide amatic text-[#3D2914] flex items-center gap-2">
            {title}
            {titleExtra}
          </h1>
          <p className="text-[11px] text-[#8B7355] font-medium">{subtitle}</p>
        </div>
      </div>

      {/* User Avatar Card */}
      {context?.user ? (
        <div className="glazed-card px-3 py-2 flex items-center gap-2 animate-scale-in">
          <Avatar className="h-8 w-8 ring-2 ring-[#D4915D]/40">
            <AvatarImage
              src={userAvatarUrl || undefined}
              alt={userDisplayName}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-[#D4915D] to-[#B8763C] text-white text-xs font-bold">
              {initialsFrom(userDisplayName)}
            </AvatarFallback>
          </Avatar>
          <div className="leading-tight text-left">
            <div className="text-sm font-bold text-[#3D2914]">{userDisplayName}</div>
            {userHandle ? (
              <div className="text-[10px] text-[#8B7355]">{userHandle}</div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
