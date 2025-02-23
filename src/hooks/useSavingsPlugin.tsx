"use client";

import {
  savingsPluginActions,
  SavingsPlugin,
  SavingsPluginAbi,
} from "@/plugins/savings/plugin";
import { toast } from "sonner";
import { Address } from "viem";
import { viemChain } from "@/config/chains";
import { publicClient } from "../clients/publicViemClient";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import useTransactionApis from "./useTransactionApis";

const useSavingsPlugin = () => {
  const { getTransactionReceipt, getUserOperationByHash } =
    useTransactionApis();
  const { setInLocalStorage, removeFromLocalStorage } = useLocalStorage();
  const savingsPluginAddress = SavingsPlugin.meta.addresses[viemChain.id];

  const getSavingsAutomations = async (userAddress: Address) => {
    try {
      const result = await publicClient.readContract({
        address: savingsPluginAddress,
        abi: SavingsPluginAbi,
        functionName: "savingsAutomations",
        args: [userAddress],
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
    args: [Address, bigint]
  ) => {
    console.log("Creating Automation");
    console.log("savingsAddress:", args[0]);

    try {
      const res = await extendedAccount.createAutomation({ args });
      setInLocalStorage("automationCreated", Boolean(true).toString());
      setInLocalStorage("savingsAddress", args[0] as string);
      console.log("Automation created with userop hash:", res.hash);
      toast.success(`Automation Creation initiated. UserOp Sent`);

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
      toast.success(`Tx mined.`);

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
      toast.success(`Plugin Installation initiated. UserOp Sent`);

      let txHash;

      while (!txHash) {
        txHash = await getUserOperationByHash(result.hash);
        if (txHash) {
          console.log("txHash:", txHash);
          break;
        }
        console.log("Waiting for txHash...");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
      }
      toast.success(`Tx mined.`);

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
      toast.success(`Plugin Uninstallation initiated. UserOp Sent`);
      removeFromLocalStorage("automationCreated");

      let txHash;

      while (!txHash) {
        txHash = await getUserOperationByHash(result.hash);
        if (txHash) {
          console.log("txHash:", txHash);
          break;
        }
        console.log("Waiting for txHash...");
        await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for 3 seconds before retrying
      }
      toast.success(`Tx mined.`);

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
