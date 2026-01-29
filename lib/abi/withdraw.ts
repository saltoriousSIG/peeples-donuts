// Withdraw Facet ABI - handles withdrawal operations
export const WITHDRAW = [
  {
    inputs: [
      { internalType: "uint256", name: "shareAmount", type: "uint256" },
    ],
    name: "withdraw",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
    name: "withdrawUnusedRewards",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: "address", name: "user", type: "address" },
      {
        indexed: false,
        internalType: "uint256",
        name: "sharesBurned",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "wethOut",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "donutOut",
        type: "uint256",
      },
    ],
    name: "WithdrawalExecuted",
    type: "event",
  },
] as const;
