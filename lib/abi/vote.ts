// Vote Facet ABI - handles strategy voting and epoch management
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
