export const CONTRACT_ADDRESSES = {
  weth: "0x4200000000000000000000000000000000000006",
  donut: "0xAE4a37d554C6D6F3E398546d8566B25052e0169C",
  miner: "0xF69614F4Ee8D4D3879dd53d5A039eB3114C794F6",
  multicall: "0x3ec144554b484C6798A683E34c8e8E222293f323",
  provider: "0x463B1E8E78B28027b423Ea6f00695f01a84EFe72",
  pool: "0xa1B7E146fE49FAC1622670467465d3ea6d801004",
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
