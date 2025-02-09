import { publicClient } from "@/clients/publicViemClient";
import { formatEther, type Address } from "viem";

export default function useViem() {
  async function getEthBalance(address: Address) {
    const balance = await publicClient.getBalance({ address });
    return formatEther(balance);
  }

  return { getEthBalance };
}
