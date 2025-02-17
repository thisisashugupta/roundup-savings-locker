import { encodeAbiParameters } from "viem";
import { LocalAccountSigner } from "@aa-sdk/core";
import { alchemy, sepolia } from "@account-kit/infra";
import { createModularAccountAlchemyClient } from "@account-kit/smart-contracts";

const useSignWithAlchemy = () => {
  const getModularAccountAlchemyClient = async () => {
    const modularAccountClient = await createModularAccountAlchemyClient({
      // @ts-ignore
      signer: LocalAccountSigner.privateKeyToAccountSigner(
        `0x${process.env.NEXT_PUBLIC_PRIVATE_KEY!}`
      ),
      chain: sepolia,
      transport: alchemy({
        apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY as string,
      }),
    });
    console.log("MSCA:", modularAccountClient.account.address);
    return modularAccountClient;
  };

  const sendToken = async (extendedAccount: any) => {
    try {
      const TOKEN_ADDRESS = "0x6cA46FEA522c78065138c4068fF7cA2a1415703c";
      const RECIPIENT = "0x20869e8896E1b5f46311717747862A1f6F1Cf08C";
      const AMOUNT = BigInt(1500000);

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
          target: TOKEN_ADDRESS as `0x${string}`,
          data: data as `0x${string}`,
          value: BigInt(0.044 * 10 ** 18),
        },
      });

      console.log("User Operation Hash:", res.hash);
      return res.hash;
    } catch (e) {
      console.error("Sending UserOp Failed", e);
    }
  };

  return {
    getModularAccountAlchemyClient,
    sendToken,
  };
};

export default useSignWithAlchemy;
