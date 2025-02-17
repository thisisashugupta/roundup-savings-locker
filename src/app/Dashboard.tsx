"use client";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { Address } from "viem";
import { useState, useEffect } from "react";
import useSignWithAlchemy from "@/hooks/useSignWithAlchemy";
import useSavingsPlugin from "@/hooks/useSavingsPlugin";
import useViem from "@/hooks/useViem";
import { USDC } from "@/config/tokens";
import { viemChain } from "@/config/chains";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type TSPState = {
  installing: boolean;
  installed: boolean;
  uninstalling: boolean;
};
const defaultSPState: TSPState = {
  installing: false,
  installed: false,
  uninstalling: false,
};
// savings plugin state

type TAutomationState = {
  creating: boolean;
  created: boolean;
};
const defaultAutomationState: TAutomationState = {
  creating: false,
  created: false,
};

export default function Dashboard({
  walletAddress,
  setModalOpen,
}: {
  walletAddress: Address;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { removeFromLocalStorage, getFromLocalStorage } = useLocalStorage();
  // State
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [walletTokenBalance, setWalletTokenBalance] = useState<string>("0");
  const [msca, setMsca] = useState<Address | undefined>();
  const [mscaBalance, setMscaBalance] = useState<string>("0");
  const [mscaTokenBalance, setMscaTokenBalance] = useState<string>("0");
  const [extendedAccount, setExtendedAccount] = useState<any>();
  const [savingsAddress, setSavingsAddress] = useState<Address | string>(
    getFromLocalStorage("savingsAddress") ?? ""
  );
  const [savingsTokenBalance, setSavingsTokenBalance] = useState<string>("0");
  const [roundUpAmount, setRoundUpAmount] = useState<number>(1000000);
  const [recipient, setRecipient] = useState<Address | string>("");
  const [SPState, setSPState] = useState<TSPState>(defaultSPState);
  const [sendingToken, setSendingToken] = useState<boolean>(false);
  const [sendTokenAmount, setSendTokenAmount] = useState<bigint>(
    BigInt(1500000)
  );
  const [automationState, setAutomationState] = useState<TAutomationState>({
    ...defaultAutomationState,
    created: Boolean(getFromLocalStorage("automationCreated")),
  });

  // Hooks
  const { getModularAccountAlchemyClient, sendToken } = useSignWithAlchemy();
  const {
    getExtendedAccount,
    installSavingsPlugin,
    uninstallSavingsPlugin,
    isSavingsPluginInstalled,
    createAutomation,
    getSavingsAutomations,
  } = useSavingsPlugin();
  const { getEthBalance, getTokenBalance } = useViem();

  // Function Handlers
  const sendTokenUO = async () => {
    if (recipient.length !== 42) {
      toast.error("Invalid receipient address");
      return;
    }

    setSendingToken(true);
    sendToken(extendedAccount, recipient as Address, sendTokenAmount).finally(
      () => setSendingToken(false)
    );
  };

  const handleCreateAutomation = async () => {
    if (!extendedAccount) {
      toast.error("Extended Account not initialized");
    }

    if (!savingsAddress) {
      toast.error("Savings Address is required");
      return;
    }

    const args: [bigint, Address, bigint] = [
      BigInt(0),
      savingsAddress as Address,
      BigInt(1000000),
    ];

    setAutomationState((prev) => ({ ...prev, creating: true }));
    createAutomation(extendedAccount, args).finally(() => {
      setAutomationState((prev) => ({
        ...prev,
        creating: false,
        created: true,
      }));
    });
  };

  const handleInstallPlugin = async () => {
    if (extendedAccount) {
      setSPState((prev) => ({ ...prev, installing: true }));
      installSavingsPlugin(extendedAccount)
        .then(() => {
          setSPState((prev) => ({
            ...prev,
            installing: false,
            installed: true,
          }));
        })
        .catch(() => {
          setSPState((prev) => ({ ...prev, installing: false }));
        });
    }
  };

  const handleUninstallPlugin = async () => {
    if (extendedAccount) {
      removeFromLocalStorage("savingsAddress");
      setSPState((prev) => ({ ...prev, uninstalling: true }));
      uninstallSavingsPlugin(extendedAccount)
        .then(() => {
          setSPState((prev) => ({
            ...prev,
            uninstalling: false,
            installed: false,
          }));
          setAutomationState((prev) => ({ ...prev, created: false }));
        })
        .catch(() => {
          setSPState((prev) => ({ ...prev, uninstalling: false }));
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
      getSavingsAutomations(msca, BigInt(0));
    }
  }, [msca]);

  // Get wallet balances
  useEffect(() => {
    if (msca) {
      (async () => {
        const balancePromise = getEthBalance(msca);
        const tokenBalancePromise = getTokenBalance(msca, USDC);
        const [balance, tokenBalance] = await Promise.all([
          balancePromise,
          tokenBalancePromise,
        ]);
        setMscaBalance(balance);
        setMscaTokenBalance(String(tokenBalance));
      })();
    }
  }, [msca, automationState.created]);

  useEffect(() => {
    if (walletAddress) {
      (async () => {
        const balancePromise = getEthBalance(walletAddress);
        const tokenBalancePromise = getTokenBalance(walletAddress, USDC);
        const [balance, tokenBalance] = await Promise.all([
          balancePromise,
          tokenBalancePromise,
        ]);
        setWalletBalance(balance);
        setWalletTokenBalance(String(tokenBalance));
      })();
    }
  }, []);

  useEffect(() => {
    if (savingsAddress) {
      (async () => {
        const tokenBalance = await getTokenBalance(
          savingsAddress as Address,
          USDC
        );
        setSavingsTokenBalance(String(tokenBalance));
      })();
    }
  }, [savingsAddress]);

  return (
    <div className="bg-[#272727] h-screen flex flex-col items-center justify-center">
      <div className="grid grid-cols-[330px_1fr] gap-x-4">
        <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-full rounded-[16px]">
          {/* Install Plugin */}
          <button
            className="w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleInstallPlugin}
          >
            {SPState.installing ? "Installing Plugin..." : "Install Plugin"}
          </button>
          {/* Create Automation */}
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleCreateAutomation}
          >
            {automationState.creating
              ? "Creating Automation..."
              : "Create Automation"}
          </button>
          {/* Send UserOp */}
          <div className="mt-5 mb-1">
            <p className="text-sm text-[#646464]">Enter Recipient Address</p>
            <input
              className="w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white"
              placeholder="0x..."
              type="text"
              value={recipient}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setRecipient(e.target.value as Address)
              }
            />
          </div>
          <div className="mt-5 mb-1">
            <p className="text-sm text-[#646464]">Enter Amount (in decimals)</p>
            <input
              className="w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white"
              type="number"
              value={Number(sendTokenAmount)}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setSendTokenAmount(BigInt(e.target.value))
              }
            />
          </div>
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={sendTokenUO}
          >
            {sendingToken ? "Sending Token..." : "Send Token"}
          </button>
          {/* Uninstall Plugin */}
          <button
            className="mt-4 w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
            onClick={handleUninstallPlugin}
          >
            {SPState.uninstalling
              ? "Uninstalling Plugin..."
              : "Uninstall Plugin"}
          </button>
        </div>

        <div>
          <div className="relative flex flex-col md:flex-row gap-3">
            <div className="absolute top-[-32px] right-[8px] flex items-center gap-2">
              <p>{viemChain.name}</p>
              <button onClick={() => setModalOpen(true)}>
                <img className="ml-auto" src="/chain-selector.svg" />
              </button>
            </div>
            {/* Top Card 1 */}
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[335px] rounded-[16px]">
              <div className="grid grid-cols-2">
                <p className="text-sm text-[#646464] text-left">
                  Connected Wallet
                </p>
              </div>
              {/* <div className="mt-5 grid grid-cols-2"> */}
              <div className="mt-5">
                <p className="text-[#646464] text-lg">Balance</p>
                <p className="text-white text-[32px] font-bold">
                  {walletBalance.slice(0, 6)} ETH
                </p>
              </div>
              <div className="mt-5">
                <p className="text-[#646464] text-lg">Token Balance</p>
                <p className="text-white text-[32px] font-bold">
                  {String(Number(walletTokenBalance) / 1e6)} USDC
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
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[335px] rounded-[16px]">
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
              <div className="mt-5">
                <p className="text-[#646464] text-lg">Token Balance</p>
                <p className="text-white text-[32px] font-bold">
                  {String(Number(mscaTokenBalance) / 1e6)} USDC
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
            <div className="px-5 py-6 bg-[#1E1E1E] w-[330px] h-[335px] rounded-[16px]">
              <p className="text-sm text-[#646464]">Savings Account</p>
              {SPState.installed ? (
                <div className="mt-[24px] mb-[24px]">
                  {automationState.created && (
                    <div className="mt-4">
                      <p className="text-[#646464] text-lg">Token Balance</p>
                      <p className="text-white text-[32px] font-bold">
                        {String(Number(savingsTokenBalance) / 1e6)} USDC
                      </p>
                    </div>
                  )}
                  <p className="mt-6 text-sm text-[#646464]">
                    {automationState.created
                      ? "Savings Address"
                      : "Enter Savings Address"}
                  </p>
                  <input
                    className="w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white"
                    placeholder="0x..."
                    type="text"
                    value={savingsAddress}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setSavingsAddress(e.target.value as Address)
                    }
                    readOnly={automationState.created}
                  />
                  <p className="mt-2 text-sm text-[#646464]">
                    {automationState.created
                      ? "Roundup Amount"
                      : "Enter Roundup Amount"}
                  </p>
                  <input
                    className="w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white"
                    type="number"
                    value={roundUpAmount}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setRoundUpAmount(Number(e.target.value))
                    }
                    readOnly={automationState.created}
                  />
                </div>
              ) : (
                <div className="my-[90px] flex flex-col items-center justify-center">
                  <p className="w-[180px] text-white text-sm text-center">
                    Install Locker Plugin for saving your funds.
                  </p>
                </div>
              )}
              {!automationState.created && (
                <button
                  className="w-full min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
                  onClick={
                    SPState.installed
                      ? handleCreateAutomation
                      : handleInstallPlugin
                  }
                >
                  {SPState.installed
                    ? automationState.creating
                      ? "Creating Automation..."
                      : "Create Automation"
                    : SPState.installing
                    ? "Installing Plugin..."
                    : "Install Plugin"}
                </button>
              )}
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
