import { useState } from "react";
import {
  createCapsuleAccount,
  createCapsuleViemClient,
} from "@usecapsule/viem-v2-integration";
import { hexStringToBase64, SuccessfulSignatureRes } from "@usecapsule/web-sdk";
import { sepolia as viemSepolia } from "viem/chains";
import { WalletClientSigner } from "@alchemy/aa-core";
import type {
  BatchUserOperationCallData,
  SendUserOperationResult,
} from "@alchemy/aa-core";
import { encodeFunctionData } from "viem";
import { http, hashMessage } from "viem";
import type { WalletClient, LocalAccount, SignableMessage, Hash } from "viem";
import capsuleClient from "../clients/capsule/capsule";
import { alchemy, sepolia } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";

// import { LocalAccountSigner } from "@alchemy/aa-core";
// import type { BatchUserOperationCallData } from "@alchemy/aa-core";
// import { encodeFunctionData } from "viem";

const useSignWithAlchemy = () => {
  const [alchemyClient, setAlchemyClient] = useState<any>();

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
      chain: viemSepolia,
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
      chain: sepolia,
      // @ts-ignore
      signer: walletClientSigner,
      transport: alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
      }),
    });

    console.log("MSCA:", alchemyClient.account.address);
    setAlchemyClient(alchemyClient);

    return alchemyClient;
  };

  const sendUserOperation = async () => {
    const demoUserOperations: BatchUserOperationCallData = [
      {
        target: "0x6cA46FEA522c78065138c4068fF7cA2a1415703c" as `0x${string}`,
        data: encodeFunctionData({
          abi: [
            {
              constant: false,
              inputs: [
                {
                  name: "_to",
                  type: "address",
                },
                {
                  name: "_value",
                  type: "uint256",
                },
              ],
              name: "transfer",
              outputs: [
                {
                  name: "",
                  type: "bool",
                },
              ],
              payable: false,
              stateMutability: "nonpayable",
              type: "function",
            },
          ],
          functionName: "transfer",
          // Test#4
          args: ["0xED7c0aE1955F75618e858fb8bb8cB6446468d7Df", BigInt(1500000)],
        }),
      },
    ];

    const userOperationResult: SendUserOperationResult =
      await alchemyClient.sendUserOperation({
        uo: demoUserOperations,
      });

    console.log("User Operation Result:", userOperationResult);
    return userOperationResult.hash;
  };

  return {
    getModularAccountAlchemyClient,
    sendUserOperation,
  };
};

export default useSignWithAlchemy;
