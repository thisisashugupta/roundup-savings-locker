import { publicClient } from "@/clients/publicViemClient";
import { formatEther, type Address } from "viem";

const erc20Abi = [
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

export default function useViem() {
  async function getEthBalance(address: Address) {
    const balance = await publicClient.getBalance({ address });
    return formatEther(balance);
  }

  async function getTokenBalance(address: Address, token: Address) {
    const balance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [address],
    });
    console.log(balance);
    return balance;
  }

  return { getEthBalance, getTokenBalance };
}
