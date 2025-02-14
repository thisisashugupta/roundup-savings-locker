"use client";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useState, useEffect } from "react";
import useSignWithAlchemy from "@/hooks/useSignWithAlchemy";
import useSavingsPlugin from "@/hooks/useSavingsPlugin";
import useViem from "@/hooks/useViem";

type TSPState = { installing: boolean; installed: boolean };
const defaultSPState: TSPState = { installing: false, installed: false };
// savings plugin state

export default function Dashboard({
  walletAddress,
  setModalOpen,
}: {
  walletAddress: Address;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [msca, setMsca] = useState<Address | undefined>();
  const [mscaBalance, setMscaBalance] = useState<string>("0");
  const [extendedAccount, setExtendedAccount] = useState<any>();
  const [savingsAddress, setSavingsAddress] = useState<Address | string>("");
  const [SPState, setSPState] = useState<TSPState>(defaultSPState);

  const { getModularAccountAlchemyClient, sendUserOperation } =
    useSignWithAlchemy();
  const {
    getExtendedAccount,
    installSavingsPlugin,
    isSavingsPluginInstalled,
    createAutomation,
    getSavingsAutomations,
    sepoliaPluginAddress,
  } = useSavingsPlugin();
  const { getEthBalance } = useViem();

  const sendUO = async () => {
    sendUserOperation()
      .then(() => {
        toast.success("UserOp sent");
        console.log("UserOp sent");
      })
      .catch((e) => {
        toast.error("Sending UserOp Failed (check console)");
        console.error("Sending UserOp Failed", e);
      });
  };

  useEffect(() => {
    if (msca) {
      getSavingsAutomations(msca, BigInt(0)).catch((e) => {
        toast.error("Fetching Savings Automations Failed (check console)");
        console.error("Fetching Savings Automations Failed", e);
      });
    }
  }, [msca]);

  const handleCreateAutomation = async () => {
    console.log("Creating Automation");
    console.log("savingsAddress:", savingsAddress);

    if (extendedAccount && savingsAddress) {
      const args: [bigint, Address, bigint] = [
        BigInt(0),
        savingsAddress as Address,
        BigInt(1000000),
      ];

      createAutomation(extendedAccount, args)
        .then(() => {
          toast.success("Automation Created");
          console.log("Automation Created");
        })
        .catch((e) => {
          toast.error("Automation Creation Failed (check console)");
          console.error("Automation Creation Failed", e);
        });
    }
  };

  const handleInstallPlugin = async () => {
    if (extendedAccount) {
      setSPState((prev) => ({ ...prev, installing: true }));
      installSavingsPlugin(extendedAccount)
        .then(() => {
          toast.success("Plugin Installed");
          console.log("Plugin Installed");
          setSPState((prev) => ({
            ...prev,
            installed: true,
            installing: false,
          }));
        })
        .catch((e) => {
          toast.success("Error Installing Plugin (check console)");
          console.error("Error Installing Plugin", e);
          setSPState((prev) => ({ ...prev, installing: false }));
        });
    }
  };

  const handleUninstallPlugin = async () => {
    if (extendedAccount) {
      setSPState((prev) => ({ ...prev, installing: true }));
      extendedAccount
        .uninstallPlugin({
          pluginAddress: sepoliaPluginAddress as `0x${string}`,
        })
        .then((res: any) => {
          toast.success("Plugin Uninstalled");
          console.log("Plugin Uninstalled with", res.hash);
          setSPState((prev) => ({
            ...prev,
            installed: true,
            installing: false,
          }));
        })
        .catch((e: any) => {
          toast.success("Error Uninstalling Plugin (check console)");
          console.error("Error Uninstalling Plugin", e);
          setSPState((prev) => ({ ...prev, installing: false }));
        });
    }
  };

  useEffect(() => {
    async function createMCSA() {
      const modularAccountClient = await getModularAccountAlchemyClient();
      const sca: Address = modularAccountClient.account.address;
      setMsca(sca);
      const extendedAccount = getExtendedAccount(modularAccountClient);
      setExtendedAccount(extendedAccount);
      const isSPInstalled = await isSavingsPluginInstalled(extendedAccount);
      setSPState((prev) => ({ ...prev, installed: isSPInstalled }));
    }
    createMCSA();
  }, []);

  useEffect(() => {
    if (msca) {
      (async () => {
        const balance = await getEthBalance(msca);
        setMscaBalance(balance);
      })();
    }
  }, [msca]);

  useEffect(() => {
    if (walletAddress) {
      (async () => {
        const balance = await getEthBalance(walletAddress);
        setWalletBalance(balance);
      })();
    }
  }, []);

  return (
    <div className="bg-[#272727] h-screen flex flex-col items-center justify-center">
      <div className="grid grid-cols-[330px_1fr] gap-x-4">
        <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-full rounded-[16px]">
          {/* Install Plugin */}
          <button
            className="w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleInstallPlugin}
          >
            Install Module
          </button>
          {/* Create Automation */}
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleCreateAutomation}
          >
            Create Automation
          </button>
          {/* Send UserOp */}
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={sendUO}
          >
            Send UserOp
          </button>
          {/* Uninstall Plugin */}
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleUninstallPlugin}
          >
            Uninstall Module
          </button>
        </div>
        <div>
          <div className="flex flex-col md:flex-row gap-3">
            {/* Top Card 1 */}
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
              <div className="grid grid-cols-2">
                <p className="text-sm text-[#646464] text-left">
                  Connected Wallet
                </p>
                <button onClick={() => setModalOpen(true)}>
                  <img className="ml-auto" src="/chain-selector.svg" />
                </button>
              </div>
              {/* <div className="mt-5 grid grid-cols-2"> */}
              <div className="mt-5">
                <p className="text-[#646464] text-lg">Total Balance</p>
                <p className="text-white text-[32px] font-bold">
                  {walletBalance.slice(0, 6)} ETH
                </p>
              </div>
              {/* <img className="ml-auto" src="/fund.svg" /> */}
              {/* </div> */}
              <p className="mt-2 mx-[5px] text-sm text-[#646464]">
                Wallet Address
              </p>
              <div className="mt-2 mx-[5px] flex items-center justify-between border border-[#272727] rounded-md p-2">
                <p className="text-white text-sm">
                  {walletAddress
                    ? walletAddress?.slice(0, 5) +
                      "..." +
                      walletAddress?.slice(-3)
                    : "loading..."}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(walletAddress);
                    toast("Copied to clipboard");
                  }}
                >
                  <img src="/copy.svg" />
                </button>
              </div>
            </div>
            {/* Top Card 2 */}
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
              <div className="grid grid-cols-2">
                <p className="text-sm text-[#646464] text-left">
                  Checking Account
                </p>
              </div>
              <div className="mt-5">
                <p className="text-[#646464] text-lg">Balance</p>
                <p className="text-white text-[32px] font-bold">
                  {mscaBalance.slice(0, 6)} ETH
                </p>
              </div>
              <p className="mt-2 mx-[5px] text-sm text-[#646464]">
                Modular Account Address
              </p>
              <div className="mt-2 mx-[5px] flex items-center justify-between border border-[#272727] rounded-md p-2">
                <p className="text-white text-sm">
                  {msca
                    ? msca.slice(0, 5) + "..." + msca.slice(-3)
                    : "loading..."}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(msca ?? "");
                    toast("Copied to clipboard");
                  }}
                >
                  <img src="/copy.svg" />
                </button>
              </div>
            </div>
            {/* Top Card 3 - Savings Account */}
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
              <p className="text-sm text-[#646464]">Savings Account</p>
              {SPState.installed ? (
                <div className="my-[34px]">
                  <p className="text-sm text-[#646464]">
                    Enter Savings Address
                  </p>
                  <input
                    className="w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white"
                    placeholder="0x..."
                    type="text"
                    value={savingsAddress}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSavingsAddress(e.target.value as Address)
                    }
                  />
                </div>
              ) : (
                <div className="my-[43px] flex flex-col items-center justify-center">
                  <p className="w-[180px] text-white text-sm text-center">
                    Install Locker Module for saving your funds.
                  </p>
                </div>
              )}
              <button
                className="w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
                onClick={
                  SPState.installed
                    ? handleCreateAutomation
                    : handleInstallPlugin
                }
              >
                {SPState.installed
                  ? "Create Automation"
                  : SPState.installing
                  ? "Installing Module..."
                  : "Install Module"}
              </button>
            </div>
          </div>
          {/* Transaction History */}
          <div className="mt-[18px] px-5 py-6 bg-[#1E1E1E] w-[1014px] h-[363px] rounded-[16px]">
            <p className="text-lg text-[#646464] text-left">
              Transaction History
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
