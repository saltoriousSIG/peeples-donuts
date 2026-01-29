// PinsAndFlair Facet ABI - handles pin minting, flair purchasing, equipping, and fusion
export const PINS_AND_FLAIR_ABI = [
  {
    inputs: [],
    name: "AlreadyHasPendingDeposit",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyHasPin",
    type: "error",
  },
  {
    inputs: [],
    name: "AlreadyWhitelisted",
    type: "error",
  },
  {
    inputs: [],
    name: "ContractNotApproved",
    type: "error",
  },
  {
    inputs: [],
    name: "FlairContractNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "FlairMintPriceNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "FlairNotConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "FlairNotEquipped",
    type: "error",
  },
  {
    inputs: [],
    name: "FlairWeightNotConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "NoAvailableFlairSlots",
    type: "error",
  },
  {
    inputs: [],
    name: "NotPoolMember",
    type: "error",
  },
  {
    inputs: [],
    name: "NotWhitelisted",
    type: "error",
  },
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
    name: "PeeplesTokenNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "PinsContractNotSet",
    type: "error",
  },
  {
    inputs: [],
    name: "ProtocolPaused",
    type: "error",
  },
  {
    inputs: [],
    name: "ReentrancyGuard__ReentrantCall",
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
    inputs: [],
    name: "StrategyNotConfigured",
    type: "error",
  },
  {
    inputs: [],
    name: "TokenIdNotConfigured",
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
        indexed: true,
        internalType: "uint256",
        name: "flairId",
        type: "uint256",
      },
    ],
    name: "FlairEquipped",
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
        indexed: true,
        internalType: "uint256",
        name: "newTokenId",
        type: "uint256",
      },
    ],
    name: "FlairFused",
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
        indexed: true,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "FlairPurchased",
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
        indexed: true,
        internalType: "uint256",
        name: "flairId",
        type: "uint256",
      },
    ],
    name: "FlairUnequipped",
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
    name: "PendingPinPurchase",
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
        indexed: true,
        internalType: "uint256",
        name: "pinId",
        type: "uint256",
      },
    ],
    name: "PinMinted",
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
    ],
    name: "WhitelistAdded",
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
    ],
    name: "WhitelistRemoved",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "addToWhitelist",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address[]",
        name: "users",
        type: "address[]",
      },
    ],
    name: "addToWhitelistBatch",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "buyFlair",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "flairId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "equipFlair",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "fuseFlair",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "getNextPinId",
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
    name: "getPendingDepositInfo",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "pendingWeth",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pendingDonut",
            type: "uint256",
          },
          {
            internalType: "uint256",
            name: "pendingShares",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "sharesCalculated",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "hasClaimed",
            type: "bool",
          },
        ],
        internalType: "struct IPinsAndFlair.PendingDepositInfo",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPinMintConfig",
    outputs: [
      {
        components: [
          {
            internalType: "address",
            name: "blazeryAddress",
            type: "address",
          },
          {
            internalType: "address",
            name: "ownerAddress",
            type: "address",
          },
          {
            internalType: "uint256",
            name: "mintPrice",
            type: "uint256",
          },
          {
            internalType: "bool",
            name: "poolActive",
            type: "bool",
          },
        ],
        internalType: "struct IPinsAndFlair.PinMintConfig",
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
    name: "getUserClaimStatus",
    outputs: [
      {
        internalType: "enum IPinsAndFlair.ClaimStatus",
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
        internalType: "address",
        name: "user",
        type: "address",
      },
    ],
    name: "isWhitelisted",
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
        internalType: "bool",
        name: "useDonut",
        type: "bool",
      },
      {
        internalType: "uint256",
        name: "_fid",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "_cid",
        type: "string",
      },
      {
        internalType: "string",
        name: "_username",
        type: "string",
      },
    ],
    name: "mintPin",
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
        name: "user",
        type: "address",
      },
    ],
    name: "removeFromWhitelist",
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
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "flairId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "cid",
        type: "string",
      },
    ],
    name: "unequipFlair",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
