"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { sdk } from "@farcaster/miniapp-sdk";
import { NavBar } from "@/components/nav-bar"
import { usePool } from "@/providers/PoolProvider"
import { useQuery } from "@tanstack/react-query"
import { formatUnits, parseUnits, zeroAddress } from "viem"
import axios from "axios";
import { CONTRACT_ADDRESSES, ERC20 } from "@/lib/contracts"
import { useReadContract, useAccount } from "wagmi"
import { base } from "wagmi/chains";
import { MiniAppContext } from "../app/page";
import { toast } from "sonner"
import { Countdown } from "./countdown"


export default function AuctionPage() {
    const [bidAmount, setBidAmount] = useState("")
    const [context, setContext] = useState<any>(null)
    const { currentAuction, minAuctionBid, auctionBid, config } = usePool()

    const { address } = useAccount();
    const [feeRecipientAddress, setFeeRecipientAddress] = useState<string>(address as string);

    const isAuctionActive = useMemo(() => {
        return currentAuction && currentAuction.highestBidder !== "0x0000000000000000000000000000000000000000"
    }, [currentAuction]);

    const formatBidAmount = (amount: number): string => {
        if (amount >= 1000000000) {
            return `${(amount / 1000000000).toFixed(2)}B`
        }
        if (amount >= 1000000) {
            return `${(amount / 1000000).toFixed(2)}M`
        }
        if (amount >= 1000) {
            return `${(amount / 1000).toFixed(2)}K`
        }
        return amount.toLocaleString()
    }

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


    const { data: currentFeeRecipient } = useQuery({
        queryKey: ['currentFeeRecipient', config?.feeRecipient],
        enabled: !!config?.feeRecipient,
        queryFn: async () => {
            // Replace with actual API call
            const { data: { user } } = await axios.get(`/api/neynar/user?address=${config?.feeRecipient}`);
            return {
                avatar: user.pfpUrl,
                name: user.displayName,
                handle: user.username,
            };
        },
        staleTime: 60000, // 1 minute
    });

    const { data: highestBidderData } = useQuery({
        queryKey: ['highestBidder', currentAuction?.highestBidder],
        enabled: !!currentAuction?.highestBidder && currentAuction.highestBidder !== zeroAddress,
        queryFn: async () => {
            // Replace with actual API call
            const { data: { user } } = await axios.get(`/api/neynar/user?address=${currentAuction?.highestBidder}`);
            return {
                avatar: user.pfpUrl,
                name: user.displayName,
                handle: user.username,
            };
        },
        staleTime: 60000, // 1 minute
    });

    const { data: userPeeplesBalance } = useReadContract({
        address: CONTRACT_ADDRESSES.peeples,
        abi: ERC20,
        functionName: 'balanceOf',
        args: [address || zeroAddress],
        chainId: base.id
    })


    const bidValue = Number.parseFloat(bidAmount) || 0
    const isValidBid = bidValue >= parseFloat(formatUnits(minAuctionBid || 0n, 18))

    const userDisplayName = context?.user?.displayName ?? context?.user?.username ?? "Farcaster user"
    const userHandle = context?.user?.username
        ? `@${context.user.username}`
        : context?.user?.fid
            ? `fid ${context.user.fid}`
            : ""
    const userAvatarUrl = context?.user?.pfpUrl ?? null

    const initialsFrom = (label?: string) => {
        if (!label) return ""
        const stripped = label.replace(/[^a-zA-Z0-9]/g, "")
        if (!stripped) return label.slice(0, 2).toUpperCase()
        return stripped.slice(0, 2).toUpperCase()
    }

    const handleBidSubmit = useCallback(async () => {
        if (!isValidBid) return toast.error("Invalid bid amount");
        if (!feeRecipientAddress || feeRecipientAddress.length !== 42) return toast.error("Invalid fee recipient address");
        try {
            await auctionBid(parseUnits(bidAmount || "0", 18), feeRecipientAddress as `0x${string}`);
        } catch (e: any) {
            console.error("Bid submission failed:", e);
        }
    }, [auctionBid, feeRecipientAddress, bidAmount]);

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
                                <AvatarImage src={userAvatarUrl || undefined} alt={userDisplayName} className="object-cover" />
                                <AvatarFallback className="bg-zinc-800 text-white">{initialsFrom(userDisplayName)}</AvatarFallback>
                            </Avatar>
                            <div className="leading-tight text-left">
                                <div className="text-sm font-bold">{userDisplayName}</div>
                                {userHandle ? <div className="text-xs text-gray-600">{userHandle}</div> : null}
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-6 pb-36 space-y-6 h-[100vh] overflow-y-scroll hide-scrollbar">
                <div className="bg-gradient-to-r from-[#5C946E] to-[#4ECDC4] rounded-full px-5 py-2 relative overflow-hidden shadow-sm">
                    <div className="relative flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <Avatar className="h-7 w-7 ring-2 ring-white/40">
                                <AvatarImage src={currentFeeRecipient?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-white/20 text-white">
                                    {currentFeeRecipient?.name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex items-center gap-2">
                                <span className="text-white text-sm font-semibold">{currentFeeRecipient?.name}</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/25 text-white/90 text-[10px] font-bold uppercase tracking-wider">
                                    Head Baker
                                </span>
                            </div>
                        </div>

                        <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-white/80 text-xs font-medium whitespace-nowrap" />
                    </div>
                </div>

                {/* Current Leader - Prominent Display */}
                {isAuctionActive ? (
                    // State: Auction Ongoing - Show current leader
                    <div className="bg-gradient-to-br from-[#F4A259] to-[#BC4B51] rounded-2xl p-6 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />

                        <div className="relative space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="px-2.5 py-1 rounded-full bg-white/30 backdrop-blur-sm">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Leading Bid</span>
                                </div>
                                <div className="text-sm text-white/90 font-semibold">
                                    <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} /> left
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 ring-4 ring-white/40 flex-shrink-0">
                                    <AvatarImage src={highestBidderData?.avatar || "/placeholder.svg"} />
                                    <AvatarFallback className="text-lg">{highestBidderData?.name[0]}</AvatarFallback>
                                </Avatar>

                                <div className="flex-1 min-w-0">
                                    <div className="text-white text-base font-bold truncate">{highestBidderData?.name}</div>
                                    <div className="text-white/80 text-sm truncate">{highestBidderData?.handle}</div>
                                </div>
                            </div>

                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mt-3">
                                <div className="flex items-baseline justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="text-3xl font-bold text-white tabular-nums truncate">
                                            {formatBidAmount(Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)))}
                                        </div>
                                        <div className="text-xs text-white/70 mt-0.5">{Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)).toLocaleString()} $PEEPLES</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    // State: No Bids Yet - Show open auction invitation
                    <div className="bg-gradient-to-br from-[#F4A259] to-[#BC4B51] rounded-2xl p-6 relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8" />

                        <div className="relative space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="px-2.5 py-1 rounded-full bg-white/30 backdrop-blur-sm">
                                    <span className="text-xs font-bold uppercase tracking-wider text-white">Auction Open</span>
                                </div>
                                <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-white/80 text-xs font-medium whitespace-nowrap" />
                            </div>

                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 ring-4 ring-white/30">
                                    <div className="text-4xl">🍩</div>
                                </div>

                                <div className="text-white text-2xl font-bold mb-2">No Bids Yet</div>
                                <div className="text-white/80 text-sm max-w-xs">
                                    Be the first to bid and secure exclusive rights to 90% of protocol fees for 3 days
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#3D405B]/10 p-7 shadow-sm hover:shadow-md transition-all duration-300">
                    <div className="space-y-5">
                        <div>
                            <label className="text-[10px] text-[#3D405B]/60 uppercase tracking-[0.12em] mb-2.5 block font-semibold">
                                Your Bid
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white text-black border-2 border-[#BC4B51]/20 rounded-xl px-5 py-4 text-lg placeholder:text-[#3D405B]/30 focus:outline-none focus:ring-4 focus:border-[#BC4B51] focus:ring-[#BC4B51]/10 transition-all tabular-nums font-semibold"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#3D405B]/40 font-semibold">
                                    $PEEPLES
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] text-[#3D405B]/60 uppercase tracking-[0.12em] mb-2.5 block font-semibold">
                                Fee Recipient Address
                            </label>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={feeRecipientAddress}
                                    onChange={(e) => setFeeRecipientAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-white text-black border-2 border-[#5C946E]/20 rounded-xl px-5 py-3 placeholder:text-[#3D405B]/30 focus:outline-none focus:ring-4 focus:border-[#5C946E] focus:ring-[#5C946E]/10 transition-all font-mono text-xs"
                                />
                                <button
                                    onClick={() => {
                                        setFeeRecipientAddress(address || "")
                                    }}
                                    className="text-xs text-[#5C946E] hover:text-[#5C946E]/80 font-semibold uppercase tracking-wider transition-colors"
                                >
                                    Use Connected Wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
                                </button>
                            </div>
                        </div>

                        <div className="pt-3 space-y-2.5 border-t border-[#3D405B]/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#3D405B]/50 font-medium">Your Balance</span>
                                <span className="font-bold text-[#3D405B] tabular-nums">{parseFloat(formatUnits(userPeeplesBalance || 0n, 18)).toLocaleString()} $PEEPLES</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#3D405B]/50 font-medium">Minimum Bid</span>
                                <span className="font-bold text-[#BC4B51] tabular-nums">{parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES</span>
                            </div>
                        </div>

                        <button
                            onClick={handleBidSubmit}
                            disabled={!isValidBid}
                            className="w-full bg-[#BC4B51] hover:bg-[#BC4B51]/90 text-white font-bold text-sm tracking-wide h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:bg-[#3D405B]/20 disabled:text-[#3D405B]/40 disabled:shadow-none disabled:cursor-not-allowed"
                        >
                            {isAuctionActive
                                ? isValidBid
                                    ? "PLACE BID"
                                    : `Minimum ${parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES`
                                : isValidBid
                                    ? "BE THE FIRST TO BID"
                                    : "ENTER BID AMOUNT"}
                        </button>
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-[#3D405B]/10 p-7 shadow-sm hover:shadow-md transition-all duration-300">
                    <h3 className="text-lg font-bold text-[#3D405B] mb-6 tracking-tight">What You Win</h3>

                    <div className="space-y-5">
                        {[
                            {
                                num: 1,
                                color: "#F4A259",
                                title: "90% of Protocol Fees",
                                desc: "Earn $DONUT and $WETH from all pool fees generated for 3 consecutive days",
                            },
                            {
                                num: 2,
                                color: "#5C946E",
                                title: "3-Day Exclusive Rights",
                                desc: "Rights begin immediately after auction ends and last exactly three days",
                            },
                            {
                                num: 3,
                                color: "#BC4B51",
                                title: "Blazery Boost",
                                desc: "Your bid + 10% of fees flow into blazery, increasing PEEPLES/DONUT LP burn value for everyone",
                            },
                        ].map((benefit) => (
                            <div key={benefit.num} className="flex gap-4 group">
                                <div
                                    className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all group-hover:scale-110 shadow-sm"
                                    style={{
                                        backgroundColor: `${benefit.color}15`,
                                        border: `2px solid ${benefit.color}30`,
                                        color: benefit.color,
                                    }}
                                >
                                    {benefit.num}
                                </div>
                                <div className="flex-1 pt-0.5">
                                    <h4 className="text-sm font-bold text-[#3D405B] mb-1 group-hover:text-[#F4A259] transition-colors">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-xs text-[#3D405B]/60 leading-relaxed">{benefit.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <NavBar />
        </div>
    )
}
