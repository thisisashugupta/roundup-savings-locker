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
  const savingsPluginAddress = SavingsPlugin.meta.addresses[sepolia.id];

  const getSavingsAutomations = async (
    userAddress: Address,
    automationIndex: bigint
  ) => {
    try {
      const result = await publicClient.readContract({
        address: savingsPluginAddress,
        abi: SavingsPluginAbi,
        functionName: "savingsAutomations",
        args: [userAddress, automationIndex],
      });
      console.log("Savings Automations:", result);
      return result;
    } catch (e) {
      console.error("Fetching Savings Automations Failed", e);
      toast.error("Fetching Savings Automations Failed (check console)");
    }
  };

  const isSavingsPluginInstalled = async (extendedAccount: any) => {
    const installedPlugins = await extendedAccount.getInstalledPlugins({});
    console.log("Installed Plugins:", installedPlugins);
    return installedPlugins.some(
      (plugin: string) => plugin === savingsPluginAddress
    );
  };

  const getExtendedAccount = (modularAccountClient: any) => {
    // @ts-ignore
    const extendedAccount = modularAccountClient.extend(
      savingsPluginActions as unknown as any
    );
    console.log("Extended account address:", extendedAccount.account.address);
    return extendedAccount;
  };

  const createAutomation = async (
    extendedAccount: any,
    args: [bigint, Address, bigint]
  ) => {
    console.log("Creating Automation");
    console.log("savingsAddress:", args[1]);
    /**
    const sampleArgs = [
      BigInt(0), // automationIndex
      "0xFa00D29d378EDC57AA1006946F0fc6230a5E3288", // savingsAddress
      BigInt(1000000), // roundUpAmount
    ]; 
     */

    try {
      const res = await extendedAccount.createAutomation({ args });
      console.log("Automation created with userop hash:", res.hash);
      toast.success(`Automation created`);
    } catch (e) {
      console.error("Plugin Installation Failed", e);
      toast.error("Plugin Installation Failed (check console)");
      throw e;
    }
  };

  const installSavingsPlugin = async (extendedAccount: any) => {
    try {
      // @ts-ignore
      const result = await extendedAccount.installSavingsPlugin({
        args: [],
      });
      console.log("Plugin Installed with userop hash:", result.hash);
      toast.success(`Plugin Installed`);
    } catch (e) {
      toast.error("Plugin Installation Failed (check console)");
      console.error("Plugin Installation Failed", e);
      throw e;
    }
  };

  const uninstallSavingsPlugin = async (extendedAccount: any) => {
    try {
      const result = await extendedAccount.uninstallPlugin({
        pluginAddress: savingsPluginAddress as `0x${string}`,
      });
      console.log("Plugin Uninstalled with userop hash:", result.hash);
      toast.success(`Plugin Uninstalled. Hash: ${result.hash}`);
    } catch (e) {
      toast.error("Plugin Uninstallation Failed (check console)");
      console.error("Plugin Uninstallation Failed", e);
      throw e;
    }
  };

  const getInstalledPlugins = async (extendedAccount: any) => {
    const result = await extendedAccount.getInstalledPlugins({});
    console.log("Installed Plugins:", result);
    return result;
  };

  return {
    installSavingsPlugin,
    uninstallSavingsPlugin,
    getExtendedAccount,
    getInstalledPlugins,
    isSavingsPluginInstalled,
    createAutomation,
    getSavingsAutomations,
  };
};

export default useSavingsPlugin;
