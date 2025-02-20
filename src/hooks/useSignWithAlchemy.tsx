import { toast } from "sonner";
import {
  createCapsuleAccount,
  createCapsuleViemClient,
} from "@usecapsule/viem-v2-integration";
import { hexStringToBase64, SuccessfulSignatureRes } from "@usecapsule/web-sdk";
import { viemChain, aaChain } from "@/config/chains";
import { WalletClientSigner } from "@alchemy/aa-core";
import { http, hashMessage } from "viem";
import type {
  WalletClient,
  LocalAccount,
  SignableMessage,
  Hash,
  Address,
} from "viem";
import capsuleClient from "../clients/capsule/capsule";
import { encodeAbiParameters } from "viem";
import { alchemy } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";
import { USDC } from "@/config/tokens";
import useTransactionApis from "./useTransactionApis";

const useSignWithAlchemy = () => {
  const { getTransactionReceipt, getUserOperationByHash } =
    useTransactionApis();

  // Custom Sign Message function (from Capsule docs) to sign messages with Capsule
  async function customSignMessage(message: SignableMessage): Promise<Hash> {
    const hashedMessage = hashMessage(message);
    const res = await capsuleClient.signMessage(
      Object.values(capsuleClient.wallets!)[0]!.id,
      hexStringToBase64(hashedMessage)
    );

    let signature = (res as SuccessfulSignatureRes).signature;

    // Fix the v value of the signature
    const lastByte = parseInt(signature.slice(-2), 16);
    if (lastByte < 27) {
      const adjustedV = (lastByte + 27).toString(16).padStart(2, "0");
      signature = signature.slice(0, -2) + adjustedV;
    }

    return `0x${signature}`;
  }

  const getModularAccountAlchemyClient = async () => {
    /** Create Capsule Viem Client **/
    const viemCapsuleAccount: LocalAccount =
      createCapsuleAccount(capsuleClient);

    const viemClient: WalletClient = createCapsuleViemClient(capsuleClient, {
      account: viemCapsuleAccount,
      chain: viemChain,
      transport: http(process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL),
    });

    /** Configure Viem Client with Custom Sign Message **/
    viemClient.signMessage = async ({
      message,
    }: {
      message: SignableMessage;
    }): Promise<Hash> => {
      return customSignMessage(message);
    };

    const walletClientSigner = new WalletClientSigner(
      viemClient as any,
      "capsule"
    );

    /** Initialize Alchemy Client **/
    const alchemyClient = await createModularAccountAlchemyClient({
      chain: aaChain,
      // @ts-ignore
      signer: walletClientSigner,
      transport: alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
      }),
    });

    console.log("MSCA:", alchemyClient.account.address);

    return alchemyClient;
  };

  const sendToken = async (
    extendedAccount: any,
    RECIPIENT: Address,
    AMOUNT: bigint
  ) => {
    // const TOKEN_ADDRESS: Address = "0x6cA46FEA522c78065138c4068fF7cA2a1415703c";
    try {
      const transferData = encodeAbiParameters(
        [
          { name: "recipient", type: "address" },
          { name: "amount", type: "uint256" },
        ],
        [RECIPIENT, AMOUNT]
      );

      // Prepend the function selector for the transfer function
      const transferSelector = "0xa9059cbb"; // This is the selector for `transfer(address,uint256)`
      const data = transferSelector + transferData.slice(2);
      const res = await extendedAccount.sendUserOperation({
        uo: {
          target: USDC as `0x${string}`,
          data: data as `0x${string}`,
          value: BigInt(0),
        },
      });

      console.log("User Operation Hash:", res.hash);
      toast.success("UserOp sent");

      let txHash;

      while (!txHash) {
        txHash = await getUserOperationByHash(res.hash);
        if (txHash) {
          console.log("txHash:", txHash);
          break;
        }
        console.log("Waiting for txHash...");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
      }

      let txReceipt;

      while (!txReceipt) {
        txReceipt = await getTransactionReceipt(txHash);
        if (txReceipt) {
          console.log("Receipt:", txReceipt);
          break;
        }
        console.log("Waiting for txReceipt...");
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }

      const response = txReceipt.logs
        .filter(
          (log: { address: string }) =>
            log.address.toLowerCase() === USDC.toLowerCase()
        )
        .map((log: any) => ({
          from: `0x${log.topics[1].slice(26)}`,
          to: `0x${log.topics[2].slice(26)}`,
          amount: BigInt(log.data),
          hash: txHash,
        }));

      console.log("Response:", response);

      return response;
    } catch (e) {
      console.error("Sending UserOp Failed", e);
      toast.error("Sending UserOp Failed (check console)");
    }
  };

  return {
    getModularAccountAlchemyClient,
    sendToken,
  };
};

export default useSignWithAlchemy;
