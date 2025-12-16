export const CONTRACT_ADDRESSES = {
  weth: "0x4200000000000000000000000000000000000006",
  donut: "0xAE4a37d554C6D6F3E398546d8566B25052e0169C",
  peeples: "0x0eb9d965DBEfbfB131216A4250A29C9b0693Cb07",
  miner: "0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6",
  multicall: "0x3ec144554b484C6798A683E34c8e8E222293f323",
  provider: "0x463B1E8E78B28027b423Ea6f00695f01a84EFe72",
  pool: "0xa1B7E146fE49FAC1622670467465d3ea6d801004",
  peeples_blazery: "0x4Dbd0ea742CBb8331F4B2b1e9390B80C64126C7c",
} as const;

export const MULTICALL_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "provider",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "epochId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPrice",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "uri",
        type: "string",
      },
    ],
    name: "mine",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epochId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPaymentTokenAmount",
        type: "uint256",
      },
    ],
    name: "buy",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getMiner",
    outputs: [
      {
        components: [
          {
            internalType: "uint16",
            name: "epochId",
            type: "uint16",
          },
          {
            internalType: "uint192",
            name: "initPrice",
            type: "uint192",
          },
          {
            internalType: "uint40",
            name: "startTime",
            type: "uint40",
          },
          {
            internalType: "uint256",
            name: "glazed",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "dps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "nextDps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutPrice",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "miner",
            type: "address",
          },
          {
            internalType: "string",
            name: "uri",
            type: "string",
          },
          {
            internalType: "uint256",
            name: "ethBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "wethBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutBalance",
            type: "uint256",
          },
        ],
        internalType: "struct Multicall.MinerState",
        name: "state",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "getAuction",
    outputs: [
      {
        components: [
          {
            internalType: "uint16",
            name: "epochId",
            type: "uint16",
          },
          {
            internalType: "uint192",
            name: "initPrice",
            type: "uint192",
          },
          {
            internalType: "uint40",
            name: "startTime",
            type: "uint40",
          },
          {
            internalType: "address",
            name: "paymentToken",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "price",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paymentTokenPrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "wethAccumulated",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "wethBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "paymentTokenBalance",
            type: "uint256",
          },
        ],
        internalType: "struct Multicall.AuctionState",
        name: "state",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const DEPOSIT = [
  {
    inputs: [],
    name: "Ownable__NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Ownable__NotTransitiveOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "sharesMinted",
        type: "uint256",
      },
    ],
    name: "DepositMade",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "totalWethEarned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDonutEarned",
        type: "uint256",
      },
    ],
    name: "PoolFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "depositor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardsDeposited",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "depositToPool",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const WITHDRAW = [
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "totalWethEarned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDonutEarned",
        type: "uint256",
      },
    ],
    name: "PoolFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "donutAmount",
        type: "uint256",
      },
    ],
    name: "WithdrawalProcessed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "WithdrawalQueued",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const MANAGE = [
  {
    inputs: [],
    name: "Ownable__NotOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "Ownable__NotTransitiveOwner",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "price",
        type: "uint256",
      },
    ],
    name: "KingGlazerPurchased",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "totalWethEarned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "totalDonutEarned",
        type: "uint256",
      },
    ],
    name: "PoolFinalized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "depositor",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "RewardsDeposited",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "message",
        type: "string",
      },
    ],
    name: "buyKingGlazer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "checkAndFinalize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const CLAIM = [
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wethAmount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "donutAmount",
        type: "uint256",
      },
    ],
    name: "ClaimExecuted",
    type: "event",
  },
  {
    inputs: [],
    name: "claimPending",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const DATA = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "wethAmount",
        type: "uint256",
      },
    ],
    name: "calculateSharesForDeposit",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "shares",
        type: "uint256",
      },
    ],
    name: "calculateWithdrawalAmounts",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "wethOut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutOut",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.WithdrawalAmounts",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAddresses",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "miner",
            type: "address",
          },
          {
            internalType: "address",
            name: "weth",
            type: "address",
          },
          {
            internalType: "address",
            name: "donut",
            type: "address",
          },
          {
            internalType: "address",
            name: "shareToken",
            type: "address",
          },
          {
            internalType: "address",
            name: "multicall",
            type: "address",
          },
        ],
        internalType: "struct IDataFacet.Addresses",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "minDeposit",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minPoolSize",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "maxPriceBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "messagePrice",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "feeRecipient",
            type: "address",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "peeplesReward",
                type: "uint256",
              },
              {
                internalType: "address",
                name: "peeplesToken",
                type: "address",
              },
            ],
            internalType: "struct LibPeeples.RewardConfig",
            name: "reward",
            type: "tuple",
          },
          {
            components: [
              {
                internalType: "uint256",
                name: "holdingsRequirement",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "epochTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "epochDuration",
                type: "uint256",
              },
            ],
            internalType: "struct LibPeeples.VoteConfig",
            name: "vote",
            type: "tuple",
          },
          {
            internalType: "enum LibPeeples.Strategy",
            name: "strategy",
            type: "uint8",
          },
        ],
        internalType: "struct LibPeeples.Config",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPoolState",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "isActive",
            type: "bool",
          },
          {
            internalType: "uint256",
            name: "wethBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutBalance",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableWeth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableDonut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pendingClaimWeth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pendingClaimDonut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalShares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "activatedTime",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "purchasePrice",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "numPoolParticipants",
            type: "uint256",
          },
          {
            internalType: "uint16",
            name: "minerEpochId",
            type: "uint16",
          },
        ],
        internalType: "struct IDataFacet.PoolState",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSharePrice",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "wethPerShare",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutPerShare",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.SharePrice",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStats",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "totalDeposited",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDonutEarned",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalWethEarned",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalBuys",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.Stats",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getStrategy",
    outputs: [
      {
        internalType: "enum LibPeeples.Strategy",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTVL",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "wethTVL",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutTVL",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.TVL",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getTotalBalances",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "totalWeth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalDonut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableWeth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "availableDonut",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.TotalBalances",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "sharePercentage",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "wethValue",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donutValue",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "hasPendingWithdrawal",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasPendingClaim",
            type: "bool",
          },
        ],
        internalType: "struct IDataFacet.UserInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserPendingClaim",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "weth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "donut",
            type: "uint256",
          },
        ],
        internalType: "struct LibPeeples.Claim",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserPendingWithdrawal",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "shares",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "snapshotTotalShares",
            type: "uint256",
          },
        ],
        internalType: "struct LibPeeples.PendingWithdrawal",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "getUserShares",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVoteEpoch",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
    ],
    name: "getVotes",
    outputs: [
      {
        components: [
          {
            internalType: "enum LibPeeples.Strategy",
            name: "strategy",
            type: "uint8",
          },
          {
            internalType: "address",
            name: "voter",
            type: "address",
          },
        ],
        internalType: "struct LibPeeples.Vote[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWithdrawalQueue",
    outputs: [
      {
        internalType: "address[]",
        name: "",
        type: "address[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getWithdrawalQueueLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "epoch",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "hasUserVoted",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isUserParticipating",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const ERC20 = [
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
] as const;

export const VOTE = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint256",
        name: "newEpoch",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "enum LibPeeples.Strategy",
        name: "newStrategy",
        type: "uint8",
      },
    ],
    name: "EpochUpdated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "voter",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum LibPeeples.Strategy",
        name: "strategy",
        type: "uint8",
      },
    ],
    name: "VoteCast",
    type: "event",
  },
  {
    inputs: [],
    name: "updateEpoch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum LibPeeples.Strategy",
        name: "strategy",
        type: "uint8",
      },
    ],
    name: "vote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export const PEEPLES_BLAZERY = [
  {
    inputs: [
      {
        internalType: "uint256",
        name: "initPrice",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "paymentToken_",
        type: "address",
      },
      {
        internalType: "address",
        name: "paymentReceiver_",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "epochPeriod_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "priceMultiplier_",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "minInitPrice_",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "Blazery__DeadlinePassed",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__EmptyAssets",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__EpochIdMismatch",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__EpochPeriodBelowMin",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__EpochPeriodExceedsMax",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__InitPriceBelowMin",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__InitPriceExceedsMax",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__MaxPaymentAmountExceeded",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__MinInitPriceBelowMin",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__MinInitPriceExceedsAbsMaxInitPrice",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__PriceMultiplierBelowMin",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__PriceMultiplierExceedsMax",
    type: "error",
  },
  {
    inputs: [],
    name: "Blazery__Reentrancy",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "token",
        type: "address",
      },
    ],
    name: "SafeERC20FailedOperation",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "buyer",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "assetsReceiver",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "paymentAmount",
        type: "uint256",
      },
    ],
    name: "Blazery__Buy",
    type: "event",
  },
  {
    inputs: [],
    name: "ABS_MAX_INIT_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "ABS_MIN_INIT_PRICE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_EPOCH_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MAX_PRICE_MULTIPLIER",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_EPOCH_PERIOD",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MIN_PRICE_MULTIPLIER",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "PRICE_MULTIPLIER_SCALE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "assets",
        type: "address[]",
      },
      {
        internalType: "address",
        name: "assetsReceiver",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "epochId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxPaymentTokenAmount",
        type: "uint256",
      },
    ],
    name: "buy",
    outputs: [
      {
        internalType: "uint256",
        name: "paymentAmount",
        type: "uint256",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "epochPeriod",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getSlot0",
    outputs: [
      {
        components: [
          {
            internalType: "uint8",
            name: "locked",
            type: "uint8",
          },
          {
            internalType: "uint16",
            name: "epochId",
            type: "uint16",
          },
          {
            internalType: "uint192",
            name: "initPrice",
            type: "uint192",
          },
          {
            internalType: "uint40",
            name: "startTime",
            type: "uint40",
          },
        ],
        internalType: "struct Blazery.Slot0",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "minInitPrice",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentReceiver",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "paymentToken",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "priceMultiplier",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export const PEEPLES_AUCTION = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: true,
        internalType: "address",
        name: "bidder",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "feeRecipient",
        type: "address",
      },
    ],
    name: "AuctionBid",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningBid",
        type: "uint256",
      },
    ],
    name: "AuctionSettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "winningBid",
        type: "uint256",
      },
    ],
    name: "AuctionSettled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "AuctionStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
    ],
    name: "AuctionStarted",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address",
      },
    ],
    name: "bid",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentAuction",
    outputs: [
      {
        internalType: "uint256",
        name: "auctionId",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "endTime",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "highestBidder",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "highestBid",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "feeRecipient",
        type: "address",
      },
      {
        internalType: "bool",
        name: "ended",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getMinimumBid",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;
