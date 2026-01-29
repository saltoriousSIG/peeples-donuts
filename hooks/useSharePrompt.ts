"use client";

import { useState, useCallback } from "react";
import { type ShareAction } from "@/components/share-modal";

interface ShareDetails {
  embed: string;
  message: string;
  imageUrl?: string;
}

interface UseSharePromptReturn {
  isOpen: boolean;
  action: ShareAction | null;
  details: ShareDetails;
  openShare: (action: ShareAction, details: ShareDetails) => void;
  closeShare: () => void;
}

// Default messages for each action type
const defaultMessages: Record<ShareAction, (details?: string) => string> = {
  "king-glazer": () =>
    "I just bought King Glazer for the Peeples Pool, and earned 25K $PEEPLES! Let's get glazed together",
  deposit: (amount) =>
    `I just deposited ${amount || ""} to the Peeples Donuts Family Pool! Come join the family`,
  withdraw: (amount) =>
    `I just withdrew ${amount || ""} from the Peeples Pool! The glazed life is good`,
  claim: () => "I just claimed my pool rewards from Peeples Donuts!",
  "mint-pin": () =>
    "I just joined the Peeples Donuts family! Come get glazed with us!",
  "equip-flair": (gauge) =>
    `I just equipped ${gauge || ""} flair on my Peeples Pin! Earning yield now`,
  "claim-yield": (amount) =>
    `Just claimed ${amount || ""} yield from Peeples Donuts! The glazed life is good`,
  "fuse-flair": (rarity) =>
    `I just upgraded to ${rarity || ""} flair! Level up with Peeples Donuts`,
};

export function useSharePrompt(): UseSharePromptReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<ShareAction | null>(null);
  const [details, setDetails] = useState<ShareDetails>({
    embed: "https://peeplesdonuts.com",
    message: "",
  });

  const openShare = useCallback((newAction: ShareAction, newDetails: ShareDetails) => {
    setAction(newAction);
    setDetails({
      ...newDetails,
      message: newDetails.message || defaultMessages[newAction]?.() || "",
    });
    setIsOpen(true);
  }, []);

  const closeShare = useCallback(() => {
    setIsOpen(false);
    setAction(null);
  }, []);

  return {
    isOpen,
    action,
    details,
    openShare,
    closeShare,
  };
}

// Helper function to create share details for specific actions
export function createShareDetails(
  action: ShareAction,
  customMessage?: string,
  imageUrl?: string
): ShareDetails {
  return {
    embed: "https://peeplesdonuts.com",
    message: customMessage || defaultMessages[action]?.() || "",
    imageUrl,
  };
}
