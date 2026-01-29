"use client"

import { useState, useMemo, useCallback } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavBar } from "@/components/nav-bar"
import { PageHeader, type MiniAppContext } from "@/components/page-header"
import { useFrameContext } from "@/providers/FrameSDKProvider"
import { usePool } from "@/providers/PoolProvider"
import { useQuery } from "@tanstack/react-query"
import { formatUnits, parseUnits, zeroAddress } from "viem"
import axios from "axios";
import { CONTRACT_ADDRESSES } from "@/lib/contracts"
import { ERC20 } from "@/lib/abi/erc20"
import { useReadContract, useAccount } from "wagmi"
import { base } from "wagmi/chains";
import { toast } from "sonner"
import { Countdown } from "./countdown"
import { Gavel, Crown, Timer, Coins, Gift, Flame, Wallet, ArrowRight, Trophy } from "lucide-react"

export default function AuctionPage() {
    const [bidAmount, setBidAmount] = useState("")
    const { context: frameContext } = useFrameContext()
    const context = frameContext as MiniAppContext | null
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

    const { data: currentFeeRecipient } = useQuery({
        queryKey: ['currentFeeRecipient', config?.feeRecipient],
        enabled: !!config?.feeRecipient,
        queryFn: async () => {
            const { data: { user } } = await axios.get(`/api/neynar/user?address=${config?.feeRecipient}`);
            return {
                avatar: user.pfpUrl,
                name: user.displayName,
                handle: user.username,
            };
        },
        staleTime: 60000,
    });

    const { data: highestBidderData } = useQuery({
        queryKey: ['highestBidder', currentAuction?.highestBidder],
        enabled: !!currentAuction?.highestBidder && currentAuction.highestBidder !== zeroAddress,
        queryFn: async () => {
            const { data: { user } } = await axios.get(`/api/neynar/user?address=${currentAuction?.highestBidder}`);
            return {
                avatar: user.pfpUrl,
                name: user.displayName,
                handle: user.username,
            };
        },
        staleTime: 60000,
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

    const handleBidSubmit = useCallback(async () => {
        if (!isValidBid) return toast.error("Invalid bid amount");
        if (!feeRecipientAddress || feeRecipientAddress.length !== 42) return toast.error("Invalid fee recipient address");
        try {
            await auctionBid(parseUnits(bidAmount || "0", 18), feeRecipientAddress as `0x${string}`);
        } catch (e: unknown) {
            console.error("Bid submission failed:", e);
        }
    }, [auctionBid, feeRecipientAddress, bidAmount, isValidBid]);

    const benefits = [
        {
            icon: Coins,
            color: "#FFD700",
            title: "90% of Protocol Fees",
            desc: "Earn $DONUT and $WETH from all pool fees for 3 days",
        },
        {
            icon: Timer,
            color: "#82AD94",
            title: "3-Day Exclusive Rights",
            desc: "Rights begin immediately after auction ends",
        },
        {
            icon: Flame,
            color: "#FFB5BA",
            title: "Blazery Boost",
            desc: "Your bid + 10% of fees fuel PEEPLES/DONUT LP burn",
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#FDF6E3] via-[#FAF0DC] to-[#F5E6C8]">
            {/* Decorative elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[8%] left-[6%] w-4 h-4 rounded-full bg-[#F4A627] opacity-25 animate-bounce-in" style={{ animationDelay: '0.1s' }} />
                <div className="absolute top-[15%] right-[10%] w-3 h-3 rounded-full bg-[#E85A71] opacity-20 animate-bounce-in" style={{ animationDelay: '0.2s' }} />
                <div className="absolute bottom-[35%] left-[8%] w-2 h-2 rounded-full bg-[#6B9B7A] opacity-25 animate-bounce-in" style={{ animationDelay: '0.3s' }} />
            </div>

            <div className="flex flex-1 flex-col text-[#3D2914] p-3">
                <PageHeader
                    title="FEE AUCTION"
                    subtitle="Bid for protocol fee rights"
                    context={context}
                />
            </div>

            <div className="max-w-2xl mx-auto px-4 pb-36 space-y-4 h-[calc(100vh-100px)] overflow-y-auto scrollbar-styled">
                {/* Current Head Baker Banner */}
                <div className="glazed-card p-3 opacity-0 animate-slide-up">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-[#82AD94]/30">
                                <AvatarImage src={currentFeeRecipient?.avatar || "/placeholder.svg"} />
                                <AvatarFallback className="text-xs bg-gradient-to-br from-[#82AD94] to-[#5C946E] text-white">
                                    {currentFeeRecipient?.name?.[0] ?? "?"}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-[#2D2319]">{currentFeeRecipient?.name ?? "Unknown"}</span>
                                    <span className="px-2 py-0.5 rounded-full bg-[#82AD94]/20 text-[#5C946E] text-[9px] font-bold uppercase">
                                        Head Baker
                                    </span>
                                </div>
                                <span className="text-[10px] text-[#A89485]">Current fee recipient</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-[#A89485]">Time Left</div>
                            <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-sm font-bold text-[#2D2319]" />
                        </div>
                    </div>
                </div>

                {/* Leading Bid Hero Card */}
                {isAuctionActive ? (
                    <div className="glazed-card p-5 opacity-0 animate-slide-up glow-gold" style={{ animationDelay: '0.05s' }}>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFD700] to-[#FFA500] p-5">
                            <div className="absolute top-2 right-4 w-24 h-24 rounded-full bg-white/10 blur-xl" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full bg-white/5 blur-lg" />

                            <div className="relative">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <Trophy className="w-5 h-5 text-white" />
                                        <span className="text-sm font-bold text-white uppercase tracking-wide">Leading Bid</span>
                                    </div>
                                    <div className="bg-white/20 rounded-lg px-2 py-1">
                                        <Countdown endTime={Number(currentAuction?.endTime || 0) * 1000} className="text-xs font-bold text-white" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-16 w-16 ring-4 ring-white/30">
                                        <AvatarImage src={highestBidderData?.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xl bg-white/20 text-white">{highestBidderData?.name?.[0] ?? "?"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="text-xl font-bold text-white">{highestBidderData?.name ?? "Unknown"}</div>
                                        <div className="text-white/80 text-sm">@{highestBidderData?.handle ?? "unknown"}</div>
                                    </div>
                                </div>

                                <div className="bg-white/20 rounded-xl p-4">
                                    <div className="text-4xl font-bold text-white amatic">
                                        {formatBidAmount(Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)))}
                                    </div>
                                    <div className="text-xs text-white/70">
                                        {Number.parseFloat(formatUnits(currentAuction?.highestBid || 0n, 18)).toLocaleString()} $PEEPLES
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.05s' }}>
                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#FFD700]/80 to-[#FFA500]/80 p-6 text-center">
                            <div className="absolute top-2 right-4 w-20 h-20 rounded-full bg-white/10 blur-xl" />

                            <div className="relative">
                                <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4 ring-4 ring-white/30">
                                    <span className="text-4xl">🍩</span>
                                </div>
                                <h3 className="text-2xl font-bold text-white amatic mb-2">No Bids Yet</h3>
                                <p className="text-white/80 text-sm max-w-xs mx-auto">
                                    Be the first to bid and secure exclusive rights to 90% of protocol fees for 3 days
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bid Form */}
                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="space-y-4">
                        <div>
                            <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-2">
                                Your Bid
                            </div>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    placeholder="0"
                                    className="w-full bg-white/70 text-[#2D2319] border-2 border-transparent rounded-xl px-4 py-4 text-lg font-semibold placeholder:text-[#A89485]/50 focus:outline-none focus:border-[#FFD700] transition-all"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-[#A89485] font-semibold">
                                    $PEEPLES
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-[#5C4A3D] uppercase tracking-wider mb-2">
                                Fee Recipient Address
                            </div>
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={feeRecipientAddress}
                                    onChange={(e) => setFeeRecipientAddress(e.target.value)}
                                    placeholder="0x..."
                                    className="w-full bg-white/70 text-[#2D2319] border-2 border-transparent rounded-xl px-4 py-3 font-mono text-xs placeholder:text-[#A89485]/50 focus:outline-none focus:border-[#82AD94] transition-all"
                                />
                                <button
                                    onClick={() => setFeeRecipientAddress(address || "")}
                                    className="flex items-center gap-1 text-xs text-[#82AD94] hover:text-[#5C946E] font-semibold transition-colors"
                                >
                                    <Wallet className="w-3 h-3" />
                                    Use Connected Wallet ({address?.slice(0, 6)}...{address?.slice(-4)})
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/30 rounded-xl p-3 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[#5C4A3D]">Your Balance</span>
                                <span className="font-bold text-[#2D2319]">
                                    {parseFloat(formatUnits(userPeeplesBalance || 0n, 18)).toLocaleString()} $PEEPLES
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[#5C4A3D]">Minimum Bid</span>
                                <span className="font-bold text-[#FFD700]">
                                    {parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleBidSubmit}
                            disabled={!isValidBid}
                            className="btn-glazed w-full py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                background: isValidBid
                                    ? "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)"
                                    : undefined,
                            }}
                        >
                            {isAuctionActive
                                ? isValidBid
                                    ? <>
                                        <Gavel className="w-4 h-4 mr-2" />
                                        PLACE BID
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                      </>
                                    : `Minimum ${parseFloat(formatUnits(minAuctionBid || 0n, 18)).toLocaleString()} $PEEPLES`
                                : isValidBid
                                    ? <>
                                        <Crown className="w-4 h-4 mr-2" />
                                        BE THE FIRST TO BID
                                      </>
                                    : "ENTER BID AMOUNT"}
                        </button>
                    </div>
                </div>

                {/* Benefits Card */}
                <div className="glazed-card p-5 opacity-0 animate-slide-up" style={{ animationDelay: '0.15s' }}>
                    <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-5 h-5 text-[#FFD700]" />
                        <h3 className="text-lg font-bold text-[#2D2319]">What You Win</h3>
                    </div>

                    <div className="space-y-4">
                        {benefits.map((benefit, index) => (
                            <div
                                key={index}
                                className="flex gap-3 opacity-0 animate-slide-up"
                                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                            >
                                <div
                                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm"
                                    style={{ backgroundColor: `${benefit.color}20` }}
                                >
                                    <benefit.icon className="w-5 h-5" style={{ color: benefit.color }} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-bold text-[#2D2319] mb-0.5">
                                        {benefit.title}
                                    </h4>
                                    <p className="text-xs text-[#5C4A3D] leading-relaxed">
                                        {benefit.desc}
                                    </p>
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
