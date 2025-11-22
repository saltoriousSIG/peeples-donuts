"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MiniAppContext } from "../page";
import { sdk } from "@farcaster/miniapp-sdk";
import { NavBar } from "@/components/nav-bar";

export default function PoolsPage() {
  const [amount, setAmount] = useState("");
  const [isInPool, setIsInPool] = useState(true);
  const [context, setContext] = useState<MiniAppContext | null>(null);
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  useEffect(() => {
    let cancelled = false;
    const hydrateContext = async () => {
      try {
        const ctx = (await (
          sdk as unknown as {
            context: Promise<MiniAppContext> | MiniAppContext;
          }
        ).context) as MiniAppContext;
        if (!cancelled) {
          setContext(ctx);
        }
      } catch {
        if (!cancelled) setContext(null);
      }
    };
    hydrateContext();
    return () => {
      cancelled = true;
    };
  }, []);

  const userDisplayName =
    context?.user?.displayName ?? context?.user?.username ?? "Farcaster user";
  const userHandle = context?.user?.username
    ? `@${context.user.username}`
    : context?.user?.fid
      ? `fid ${context.user.fid}`
      : "";
  const userAvatarUrl = context?.user?.pfpUrl ?? null;

  const initialsFrom = (label?: string) => {
    if (!label) return "";
    const stripped = label.replace(/[^a-zA-Z0-9]/g, "");
    if (!stripped) return label.slice(0, 2).toUpperCase();
    return stripped.slice(0, 2).toUpperCase();
  };
  return (
    <div className="min-h-screen bg-[#FFFDD0] coming-soon">
      <div className="flex flex-1 flex-col text-black p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-wide amatic flex items-center justify-center">
            <img src="/media/peeples_donuts.png" className="h-[50px] w-[50px]" />
            PEEPLES DONUTS
          </h1>
          {context?.user ? (
            <div className="flex items-center gap-2 rounded-full bg-[#FFFFF0] px-2 py-1">
              <Avatar className="h-8 w-8 border border-zinc-800">
                <AvatarImage
                  src={userAvatarUrl || undefined}
                  alt={userDisplayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-zinc-800 text-white">
                  {initialsFrom(userDisplayName)}
                </AvatarFallback>
              </Avatar>
              <div className="leading-tight text-left">
                <div className="text-sm font-bold">{userDisplayName}</div>
                {userHandle ? (
                  <div className="text-xs text-gray-600">{userHandle}</div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 pb-36 space-y-6 h-[100vh] overflow-y-scroll hide-scrollbar">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#3D405B]/10 p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800 tracking-tight">
                Family Pool
              </h2>
              <p className="text-xs text-gray-800/50 mt-1">
                Pool together, earn together
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-6">
            <div className="space-y-1.5 group">
              <div className="text-[10px] text-gray-800/80 uppercase tracking-[0.1em] font-semibold">
                Total Pool
              </div>
              <div className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight group-hover:text-[#F4A259] transition-colors">
                0
              </div>
              <div className="text-xs text-gray-800 tabular-nums">$0</div>
            </div>

            <div className="space-y-1.5 group">
              <div className="text-[10px] text-gray-800/80 uppercase tracking-[0.1em] font-semibold">
                Active Bakers
              </div>
              <div className="text-3xl font-bold text-gray-800 tabular-nums tracking-tight group-hover:text-[#5C946E] transition-colors">
                0
              </div>
              <div className="text-xs text-[#5C946E] font-medium">
                +0 this week
              </div>
            </div>

            <div className="space-y-1.5 group">
              <div className="text-[10px] text-gray-800/80 uppercase tracking-[0.1em] font-semibold">
                Your Share
              </div>
              <div className="text-3xl font-bold text-[#BC4B51] tabular-nums tracking-tight group-hover:scale-105 transition-transform origin-left">
                0%
              </div>
              <div className="text-xs text-gray-800/80 tabular-nums">
                0 contributed
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#F4A259] via-[#F4A259] to-[#BC4B51] rounded-xl p-5 shadow-md hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-6 -mt-6 group-hover:scale-110 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5" />

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="inline-block px-2.5 py-1 rounded-full bg-white/25 backdrop-blur-sm mb-2">
                <span className="text-[9px] font-bold text-black tracking-widest">
                  POOL REWARD
                </span>
              </div>
              <h3 className="text-sm font-bold text-black mb-1 tracking-tight">
                Buy King Glazer for the Pool
              </h3>
              <p className="text-xs text-black/90 leading-relaxed">
                Earn{" "}
                <span className="font-bold font-mono text-blue-400 px-1 py-0.5 bg-white/20 rounded">
                  +1000 $PEEPLES
                </span>{" "}
                bonus
              </p>
            </div>

            <Button className="bg-white text-[#BC4B51] hover:bg-white/95 hover:scale-105 active:scale-95 font-bold text-xs tracking-wide px-6 h-10 rounded-xl shadow-lg hover:shadow-xl transition-all flex-shrink-0">
              BUY NOW
            </Button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#3D405B]/10 p-7 shadow-sm hover:shadow-md transition-all duration-300">
          {/* Mode Toggle */}
          <div className="flex gap-2 mb-7 p-2 bg-[#3D405B]/5 rounded-xl">
            <button
              onClick={() => setMode("deposit")}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                mode === "deposit"
                  ? "bg-[#5C946E] text-white shadow-lg shadow-[#5C946E]/20 scale-[1.02]"
                  : "text-[#3D405B]/60 hover:text-[#3D405B] hover:bg-[#3D405B]/5"
              }`}
            >
              Deposit
            </button>
            <button
              onClick={() => setMode("withdraw")}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 ${
                mode === "withdraw"
                  ? "bg-[#BC4B51] text-white shadow-lg shadow-[#BC4B51]/20 scale-[1.02]"
                  : "text-[#3D405B]/60 hover:text-[#3D405B] hover:bg-[#3D405B]/5"
              }`}
            >
              Withdraw
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-[10px] text-[#3D405B]/60 uppercase tracking-[0.12em] mb-2.5 block font-semibold">
                Amount
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={`w-full bg-white text-black border-2 rounded-xl px-5 py-4 text-lg placeholder:text-[#3D405B]/30 focus:outline-none focus:ring-4 transition-all tabular-nums font-semibold ${
                    mode === "deposit"
                      ? "border-[#5C946E]/20 focus:border-[#5C946E] focus:ring-[#5C946E]/10"
                      : "border-[#BC4B51]/20 focus:border-[#BC4B51] focus:ring-[#BC4B51]/10"
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#3D405B]/40 coming-soon font-semibold">
                  Ξ
                </div>
              </div>
            </div>

            <div className="flex gap-2.5">
              {["25%", "50%", "MAX"].map((pct) => (
                <button
                  key={pct}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-[#3D405B]/5 hover:bg-[#3D405B]/10 hover:scale-105 active:scale-95 text-xs font-bold text-[#3D405B]/70 hover:text-[#3D405B] transition-all"
                >
                  {pct}
                </button>
              ))}
            </div>

            <div className="pt-3 space-y-2.5 border-t border-[#3D405B]/5">
              {mode === "deposit" ? (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3D405B]/50 font-medium">
                      Available Balance
                    </span>
                    <span className="font-bold text-[#3D405B] tabular-nums">
                      0
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3D405B]/50 font-medium">
                      Min. Deposit
                    </span>
                    <span className="font-bold text-[#3D405B] tabular-nums">
                      Ξ 0
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3D405B]/50 font-medium">
                      Your Contribution
                    </span>
                    <span className="font-bold text-[#3D405B] tabular-nums">
                      Ξ 0 
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#3D405B]/50 font-medium">
                      Earned Rewards
                    </span>
                    <span className="font-bold text-[#5C946E] tabular-nums">
                      Ξ 0 
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button
              className={`w-full text-white font-bold text-sm tracking-wide h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                mode === "deposit"
                  ? "bg-[#5C946E] hover:bg-[#5C946E]/90 shadow-[#5C946E]/20"
                  : "bg-[#BC4B51] hover:bg-[#BC4B51]/90 shadow-[#BC4B51]/20"
              }`}
            >
              {mode === "deposit" ? "DEPOSIT TO POOL" : "WITHDRAW FROM POOL"}
            </Button>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#3D405B]/10 p-7 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-bold text-[#3D405B] mb-6 tracking-tight">
            Rules for the Pool
          </h3>

          <div className="space-y-5">
            {[
              {
                num: 1,
                color: "#F4A259",
                title: "Deposit & Shares",
                desc: "Deposit WETH when pool is idle to receive share tokens. Your shares represent your % ownership of all pool WETH and DONUT. First depositor gets 1:1 shares; later deposits priced by current pool value.",
              },
              {
                num: 2,
                color: "#5C946E",
                title: "Withdraw Anytime",
                desc: "Pool idle? Get instant withdrawal. Pool mining? Queue your withdrawal and collect after the mining cycle ends. Your proportional share of WETH + DONUT is always reserved.",
              },
              {
                num: 3,
                color: "#BC4B51",
                title: "Buying",
                desc: "Pool buys King Glazer when target price hits based on strategy vote. Anyone can trigger the buy for $PEEPLES reward, or our bot handles it. Leftover capital + rewards compound automatically.",
              },
              {
                num: 4,
                color: "#F4A259",
                title: "Weekly Strategy Votes",
                desc: "Hold 500k+ $PEEPLES to vote on pool risk strategy. Choose Conservative (≤30min break-even), Moderate (≤60min), or Degen (≤120min). One vote per address.",
              },
              {
                num: 5,
                color: "#5C946E",
                title: "Simple Fees",
                desc: "Only 1% protocol fee on mining earnings. No deposit or withdrawal fees. Share tokens are ERC20 and transferable.",
              },
            ].map((rule) => (
              <div key={rule.num} className="flex gap-4 group">
                <div
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110 shadow-sm"
                  style={{
                    backgroundColor: `${rule.color}15`,
                    border: `2px solid ${rule.color}30`,
                    color: rule.color,
                  }}
                >
                  {rule.num}
                </div>
                <div className="flex-1 pt-0.5">
                  <h4 className="text-sm font-bold text-[#3D405B] mb-1.5 tracking-tight">
                    {rule.title}
                  </h4>
                  <p className="text-xs text-[#3D405B]/60 leading-relaxed">
                    {rule.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <NavBar />
    </div>
  );
}

//<div className="space-y-1.5 group">
//  <div className="text-[10px] text-[#3D405B]/40 uppercase tracking-[0.1em] font-semibold">
//    Estimated APY
//  </div>
//  <div className="text-3xl font-bold text-[#F4A259] tabular-nums tracking-tight group-hover:text-[#BC4B51] transition-colors">
//    24.5%
//  </div>
//  <div className="text-xs text-[#3D405B]/40">Based on 30d avg</div>
//</div>
