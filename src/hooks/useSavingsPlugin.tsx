import {
  savingsPluginActions,
  SavingsPlugin,
  SavingsPluginAbi,
} from "@/plugins/savings/plugin";
import { toast } from "sonner";
import { Address } from "viem";
import { sepolia } from "viem/chains";
import { publicClient } from "../clients/publicViemClient";

const useSavingsPlugin = () => {
  const sepoliaPluginAddress = SavingsPlugin.meta.addresses[sepolia.id];

  const getSavingsAutomations = async (
    userAddress: Address,
    automationIndex: bigint
  ) => {
    const result = await publicClient.readContract({
      address: sepoliaPluginAddress,
      abi: SavingsPluginAbi,
      functionName: "savingsAutomations",
      args: [userAddress, automationIndex],
    });

    console.log("Savings Automations:", result);
    return result;
  };

  const isSavingsPluginInstalled = async (extendedAccount: any) => {
    const installedPlugins = await extendedAccount.getInstalledPlugins({});
    return installedPlugins.some(
      (plugin: string) => plugin === sepoliaPluginAddress
    );
  };

  const getExtendedAccount = (modularAccountClient: any) => {
    // @ts-ignore
    const extendedAccount = modularAccountClient.extend(
      savingsPluginActions as unknown as any
    );
    console.log("extendedAccount:", extendedAccount);
    return extendedAccount;
  };

  const createAutomation = async (
    extendedAccount: any,
    args: [bigint, Address, bigint]
  ) => {
    // const sampleArgs = [
    //   BigInt(0),
    //   "0xFa00D29d378EDC57AA1006946F0fc6230a5E3288",
    //   BigInt(1000000),
    // ];

    const res = await extendedAccount.createAutomation({ args });
    console.log("Automation created with", res);
  };

  const installSavingsPlugin = async (extendedAccount: any) => {
    try {
      // @ts-ignore
      const result = await extendedAccount.installSavingsPlugin({
        args: [],
      });
      console.log("Plugin Installation Result:", result);
      toast.success("Plugin Installed");
      toast.info(`Hash: ${result.hash}`);
      return result;
    } catch (e) {
      toast.error("Plugin Installation Failed (check console)");
      console.error("Plugin Installation Failed", e);
      throw new Error("Plugin Installation Failed" + e);
    }
  };

  const getInstalledPlugins = async (extendedAccount: any) => {
    const result = await extendedAccount.getInstalledPlugins({});
    console.log("Installed Plugins:", result);
    return result;
  };

  return {
    installSavingsPlugin,
    getExtendedAccount,
    getInstalledPlugins,
    isSavingsPluginInstalled,
    createAutomation,
    getSavingsAutomations,
    sepoliaPluginAddress,
  };
};

export default useSavingsPlugin;
