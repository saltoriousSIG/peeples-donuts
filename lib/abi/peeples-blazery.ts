// Peeples Blazery contract ABI - auction-based asset purchasing
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
