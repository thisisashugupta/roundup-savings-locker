import {
  baseSepolia as viemBaseSepolia,
  sepolia as viemSepolia,
} from "viem/chains";
import {
  baseSepolia as aaBaseSepolia,
  sepolia as aaSepolia,
} from "@account-kit/infra";

const viemChain = viemSepolia;
const aaChain = aaSepolia;

const sepoliaBlockExplorer = "https://sepolia.etherscan.io";
const baseSepoliaBlockExplorer = "https://sepolia.basescan.org";

const blockExplorer = sepoliaBlockExplorer;

export { viemChain, aaChain, blockExplorer };
