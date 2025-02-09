"use client";
import { toast } from "sonner";
import { Address } from "viem";
import { useState, useEffect } from "react";
import "@usecapsule/react-sdk/styles.css";
import useSignWithAlchemy from "@/hooks/useSignWithAlchemy";
import useSavingsPlugin from "@/hooks/useSavingsPlugin";
import useViem from "@/hooks/useViem";

export default function Dashboard({
  walletAddress,
  setModalOpen,
}: {
  walletAddress: Address;
  setModalOpen: any;
}) {
  const [walletBalance, setWalletBalance] = useState<string>("0");
  const [msca, setMsca] = useState<Address | undefined>();
  const [mscaBalance, setMscaBalance] = useState<string>("0");

  const [modularAccountClient, setModularAccountClient] = useState<any>();
  const [installingPlugin, setInstallingPlugin] = useState(false);

  const { getModularAccountAlchemyClient } = useSignWithAlchemy();
  const { installSavingsPlugin } = useSavingsPlugin();
  const { getEthBalance } = useViem();

  useEffect(() => {
    async function createMCSA() {
      const modularAccountClient = await getModularAccountAlchemyClient();
      setModularAccountClient(modularAccountClient);
      const sca: Address = modularAccountClient.account.address;
      setMsca(sca);
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
      <div className="flex flex-col md:flex-row gap-3">
        {/* Top Card 1 */}
        <div className="mt-[18px] px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
          <div className="grid grid-cols-2">
            <p className="text-sm text-[#646464] text-left">Connected Wallet</p>
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
          <p className="mt-2 mx-[5px] text-sm text-[#646464]">Wallet Address</p>
          <div className="mt-2 mx-[5px] flex items-center justify-between border border-[#272727] rounded-md p-2">
            <p className="text-white text-sm">
              {walletAddress
                ? walletAddress?.slice(0, 5) + "..." + walletAddress?.slice(-3)
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
        <div className="mt-[18px] px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
          <div className="grid grid-cols-2">
            <p className="text-sm text-[#646464] text-left">Checking Account</p>
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
              {msca ? msca.slice(0, 5) + "..." + msca.slice(-3) : "loading..."}
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
        <div className="mt-[18px] px-5 py-6 bg-[#1E1E1E] w-[330px] h-[235px] rounded-[16px]">
          <p className="text-sm text-[#646464]">Savings Account</p>
          <div className="mt-[44px] flex flex-col items-center">
            <p className="text-white text-sm w-[180px] text-center">
              Install Locker Module for saving your funds.
            </p>
            <button
              className="mt-[28px] w-fit min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
              onClick={() => {
                if (modularAccountClient) {
                  setInstallingPlugin(true);
                  installSavingsPlugin(modularAccountClient)
                    .then(() => {
                      setInstallingPlugin(false);
                    })
                    .catch((e) => {
                      setInstallingPlugin(false);
                      console.error(e);
                    });
                }
              }}
            >
              {installingPlugin ? "Installing" : "Install Module"}
            </button>
          </div>
        </div>
      </div>
      {/* Transaction History */}
      <div className="mt-[18px] px-5 py-6 bg-[#1E1E1E] w-[1014px] h-[363px] rounded-[16px]">
        <p className="text-lg text-[#646464] text-left">Transaction History</p>
      </div>
    </div>
  );
}
