// Data Facet ABI - provides read-only data access functions
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
    name: "getActiveStrategyCount",
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
    name: "getAuctionConfig",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "duration",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "minBidIncrement",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "blazeryContract",
            type: "address",
          },
          {
            internalType: "address",
            name: "defaultFeeRecipient",
            type: "address",
          },
        ],
        internalType: "struct IDataFacet.AuctionConfig",
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
            name: "deadline",
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
    name: "getCurrentAuction",
    outputs: [
      {
        components: [
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
        internalType: "struct IDataFacet.AuctionInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getCurrentEpochId",
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
        name: "epochId",
        type: "uint256",
      },
    ],
    name: "getEpoch",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "epochId",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "start_time",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "end_time",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "totalPoolAssets",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "miningBuffer",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "bufferBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "deployableCapital",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "finalized",
            type: "bool",
          },
        ],
        internalType: "struct IDataFacet.ReturnedEpoch",
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
        internalType: "uint256",
        name: "epochId",
        type: "uint256",
      },
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getEpochStrategyDeployment",
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
    name: "getEpochWithdrawalQueue",
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
    inputs: [
      {
        internalType: "enum LibPeeples.FeeTypes",
        name: "feeType",
        type: "uint8",
      },
    ],
    name: "getFeeSplit",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "blazeryBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "treasuryBps",
            type: "uint256",
          },
        ],
        internalType: "struct LibPeeples.FeeSplit",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFlairContract",
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
    name: "getFlairMintPrice",
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
        name: "flairId",
        type: "uint256",
      },
    ],
    name: "getFlairType",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "tokenId",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "weight",
            type: "uint256",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "string",
            name: "uri",
            type: "string",
          },
          {
            internalType: "string",
            name: "compositeImageURI",
            type: "string",
          },
          {
            internalType: "enum LibPeeples.FlairRarity",
            name: "rarity",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "totalMinted",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "poolFee",
            type: "uint256",
          },
        ],
        internalType: "struct LibPeeples.FlairType",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getLSGConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "gDonut",
            type: "address",
          },
          {
            internalType: "address",
            name: "lsgVault",
            type: "address",
          },
        ],
        internalType: "struct LibPeeples.LSGStakeConfig",
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
    name: "getLastClaimedEpoch",
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
        name: "pinId",
        type: "uint256",
      },
    ],
    name: "getPin",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "pinId",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            internalType: "uint256[3]",
            name: "equippedFlairIds",
            type: "uint256[3]",
          },
        ],
        internalType: "struct LibPeeples.Pin",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPinContract",
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
    name: "getPinMintPrice",
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
    inputs: [
      {
        internalType: "enum LibPeeples.FlairRarity",
        name: "rarity",
        type: "uint8",
      },
    ],
    name: "getRarityFeeRate",
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
        internalType: "enum LibPeeples.FlairRarity",
        name: "rarity",
        type: "uint8",
      },
    ],
    name: "getRarityFusionCost",
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
        internalType: "enum LibPeeples.FlairRarity",
        name: "rarity",
        type: "uint8",
      },
    ],
    name: "getRarityWeight",
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
    name: "getRebalanceInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "thresholdBps",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastRebalanceTime",
            type: "uint256",
          },
          {
            internalType: "address",
            name: "lastRebalancer",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "lastDonutSwapped",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "lastWethBought",
            type: "uint256",
          },
        ],
        internalType: "struct IDataFacet.RebalanceInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getRequiredForFuse",
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
    inputs: [
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getStrategyConfig",
    outputs: [
      {
        components: [
          {
            internalType: "bytes32",
            name: "strategyId",
            type: "bytes32",
          },
          {
            internalType: "string",
            name: "name",
            type: "string",
          },
          {
            internalType: "address",
            name: "strategyAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "rewardsToken",
            type: "address",
          },
          {
            internalType: "bool",
            name: "isTeller",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "active",
            type: "bool",
          },
          {
            internalType: "uint8",
            name: "id",
            type: "uint8",
          },
        ],
        internalType: "struct LibPeeples.StrategyConfig",
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
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getStrategyYield",
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
    name: "getTellerConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "tellerDonutVaultAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "tellerDonutStakeAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "vaultedShares",
            type: "uint256",
          },
        ],
        internalType: "struct LibPeeples.TellerStakeConfig",
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
    inputs: [],
    name: "getTotalPinWeight",
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
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getTotalStrategyWeight",
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
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getTotalWeightedShares",
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
    name: "getTreasury",
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
        name: "user",
        type: "address",
      },
    ],
    name: "getUserEpochPendingWithdrawal",
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
    name: "getUserEquippedFlair",
    outputs: [
      {
        internalType: "uint256[3]",
        name: "",
        type: "uint256[3]",
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
    name: "getUserLastDepositTime",
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
    name: "getUserPinId",
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
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getUserStrategyWeight",
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
        internalType: "address",
        name: "user",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getUserYieldDebt",
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
        internalType: "bytes32",
        name: "strategyId",
        type: "bytes32",
      },
    ],
    name: "getYieldPerWeightedShare",
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
