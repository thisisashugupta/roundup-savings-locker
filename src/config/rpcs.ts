// RPC urls
const alchemyEthSepoliaRpcUrl = process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL;
const alchemyBaseSepoliaRpcUrl =
  process.env.NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL;

export const alchemyRpcUrl = alchemyBaseSepoliaRpcUrl as string;
