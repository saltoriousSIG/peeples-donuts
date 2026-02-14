"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Strategy, Vote as VoteType, PoolConfig } from "@/types/pool.type";
import { STRATEGY_MINUTES_BREAKEVEN } from "@/lib/utils";
import { STRATEGY_NAME_MAPPING } from "@/types/pool.type";
import SundayCountdown from "./sunday-countdown";

interface VoteOptionData {
  id: Strategy;
  label: string;
  time: string;
  description: string;
  color: string;
  votes: number;
}

interface PoolVotingProps {
  vote: (strategy: Strategy) => Promise<void>;
  voteEpoch: bigint;
  votes: VoteType[];
  hasUserVoted?: boolean;
  config: PoolConfig;
}

export const PoolVoting = React.memo(function PoolVoting({
  vote,
  voteEpoch,
  votes,
  hasUserVoted,
  config,
}: PoolVotingProps) {
  const [selectedVote, setSelectedVote] = useState<Strategy | null>(null);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    setHasVoted(hasUserVoted ?? false);
  }, [hasUserVoted]);


  const currentStrategy = useMemo(() => {
    return config ? STRATEGY_NAME_MAPPING[config.strategy as Strategy] : null;
  }, [config]);

  const voteOptions: VoteOptionData[] = useMemo(() => {
    const voteTypes = [
      {
        id: Strategy.CONSERVATIVE,
        label: "Conservative",
        time: `≤${STRATEGY_MINUTES_BREAKEVEN[Strategy.CONSERVATIVE]}min`,
        description: "Lower risk, stable returns",
        color: "#5C946E",
      },
      {
        id: Strategy.MODERATE,
        label: "Moderate",
        time: `≤${STRATEGY_MINUTES_BREAKEVEN[Strategy.MODERATE]}min`,
        description: "Balanced risk & reward",
        color: "#F4A259",
      },
      {
        id: Strategy.AGGRESSIVE,
        label: "Aggressive",
        time: `≤${STRATEGY_MINUTES_BREAKEVEN[Strategy.AGGRESSIVE]}min`,
        description: "Higher risk for growth",
        color: "#BC4B51",
      },
      {
        id: Strategy.DEGEN,
        label: "Degen",
        time: `≤${STRATEGY_MINUTES_BREAKEVEN[Strategy.DEGEN]}min`,
        description: "Maximum risk & reward",
        color: "#FF6B6B",
      },
    ];
    const voteBreakdown: Record<Strategy, number> = {
      [Strategy.CONSERVATIVE]: 0,
      [Strategy.MODERATE]: 0,
      [Strategy.AGGRESSIVE]: 0,
      [Strategy.DEGEN]: 0,
    };
    votes?.forEach((vote) => {
      voteBreakdown[vote.strategy]++;
    });
    return voteTypes.map((option) => ({
      ...option,
      votes: voteBreakdown[option.id],
    }));
  }, [votes]);

  const handleVote = async() => {
    if (selectedVote !== null) {
      await vote(selectedVote);
      setHasVoted(true);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#5C946E] to-[#4ECDC4] rounded-xl p-4 shadow-lg relative overflow-hidden group hover:shadow-xl transition-all duration-300">
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold text-gray-100 tracking-tight">
              Strategy Vote
            </h3>
            <p className="text-[12px] text-gray-100/70 mt-0.5">
              Vote for next week's risk tolerance
            </p>
          </div>
          <div className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30">
            <span className="text-[9px] font-semibold text-gray-100 tracking-wider">
              <SundayCountdown />
            </span>
          </div>
        </div>

        <div>
          {currentStrategy && (
            <p className="text-[10px] text-black font-bold mb-2">
              Current Strategy:{" "}
              <span className="font-semibold">{currentStrategy}</span>
            </p>
          )}
        </div>

        {hasVoted ? (
          <div className="space-y-2">
            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-2.5 text-center">
              <p className="text-xs font-bold text-gray-100 mb-0.5">
                Vote Recorded
              </p>
              <p className="text-[10px] text-gray-100/80">
                You voted <span className="font-semibold">{selectedVote}</span>
              </p>
            </div>

            <div className="space-y-1 text-black">
              {voteOptions.map((option) => {
                const percentage = ((option.votes / votes?.length) * 100).toFixed(2);
                return (
                  <div
                    key={option.id}
                    className="flex items-center justify-between p-1.5 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20"
                  >
                    <div className="flex items-center gap-1.5 flex-1">
                      <span className="text-[10px] font-bold">
                        {option.label}
                      </span>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500 bg-white/80"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-[10px] font-bold tabular-nums ml-2">
                      {percentage}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <div className="grid grid-cols-2 gap-2">
              {voteOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedVote(option.id)}
                  className={`relative p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedVote === option.id
                      ? "bg-white shadow-lg scale-[1.02] border-2 border-white"
                      : "bg-white/15 backdrop-blur-sm border-2 border-white/30 hover:bg-white/25 hover:border-white/50 hover:scale-[1.02]"
                  }`}
                >
                  <div className="mb-1">
                    <p
                      className={`text-xs font-bold leading-tight ${
                        selectedVote === option.id
                          ? "text-[#3D405B]"
                          : "text-gray-100"
                      }`}
                    >
                      {option.label}
                    </p>
                  </div>
                  <p
                    className={`text-[9px] font-mono mb-1 ${
                      selectedVote === option.id
                        ? "text-[#3D405B]/60"
                        : "text-gray-100/70"
                    }`}
                  >
                    {option.time}
                  </p>
                  <p
                    className={`text-[9px] ${selectedVote === option.id ? "text-[#3D405B]/70" : "text-gray-100/60"}`}
                  >
                    {option.description}
                  </p>
                </button>
              ))}
            </div>

            <Button
              onClick={handleVote}
              disabled={selectedVote === null}
              className={`w-full h-9 rounded-lg font-bold text-xs tracking-wide transition-all duration-200 ${
                selectedVote !== null
                  ? "bg-white hover:bg-white/90 text-[#5C946E] shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-white/20 text-gray-100/40 cursor-not-allowed backdrop-blur-sm"
              }`}
            >
              {selectedVote !== null ? "SUBMIT VOTE" : "SELECT STRATEGY"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
});
