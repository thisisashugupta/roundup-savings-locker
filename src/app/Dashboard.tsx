'use client';

import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import type { Address } from 'viem';
import { isAddress } from 'viem';
import { useState, useEffect } from 'react';
import useSignWithAlchemy from '@/hooks/useSignWithAlchemy';
import useSavingsPlugin from '@/hooks/useSavingsPlugin';
import useViem from '@/hooks/useViem';
import { USDC, viemChain } from '@/config';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { TPluginState, TAutomationState, TTxHistoryItem, TModularSmartAccountState } from '@/types';
import ActionCenter from '@/components/feature/ActionCenter';
import ConnectedAccount from '@/components/feature/ConnectedAccount';
import SmartAccount from '@/components/feature/SmartAccount';
import SavingsAccount from '@/components/feature/SavingsAccount';
import TransactionHistory from '@/components/feature/TransactionHistory';
import Image from 'next/image';
import { getTxHistoryFromLocalStorage, serializeTxHistoryItem } from '@/utils/txHistory';

const defaultPluginState: TPluginState = {
  loading: true,
  installing: false,
  installed: false,
  uninstalling: false,
};

const defaultAutomationState: TAutomationState = {
  creating: false,
  created: false,
};

const defaultMsaState: TModularSmartAccountState = {
  address: undefined,
  balance: undefined,
  tokenBalance: undefined,
};

export default function Dashboard({
  walletAddress,
  setModalOpen,
}: {
  walletAddress: Address;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const { removeFromLocalStorage, getFromLocalStorage, setInLocalStorage } = useLocalStorage();

  // State
  const [moduleState, setPluginState] = useState<TPluginState>(defaultPluginState);
  const [automationState, setAutomationState] = useState<TAutomationState>({
    ...defaultAutomationState,
    created: Boolean(getFromLocalStorage('automationCreated')),
  });

  const [walletBalance, setWalletBalance] = useState<string>('0');
  const [walletTokenBalance, setWalletTokenBalance] = useState<string>('0');

  const [mscaState, setMsaState] = useState<TModularSmartAccountState>(defaultMsaState);

  const [extendedAccount, setExtendedAccount] = useState<any>();
  const [savingsAddress, setSavingsAddress] = useState<Address | string>(getFromLocalStorage('savingsAddress') ?? '');
  const [savingsTokenBalance, setSavingsTokenBalance] = useState<string>('0');
  const [roundUpAmount, setRoundUpAmount] = useState<bigint | undefined>(BigInt(1000000));
  const [recipient, setRecipient] = useState<Address | string>('');

  const [sendingToken, setSendingToken] = useState<boolean>(false);
  const [sendTokenAmount, setSendTokenAmount] = useState<bigint | undefined>(BigInt(1500000));
  const [txHistory, setTxHistory] = useState<TTxHistoryItem[]>(getTxHistoryFromLocalStorage());

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
    if (!recipient) {
      toast.error('Recipient address is required');
      return;
    }

    if (!isAddress(recipient)) {
      toast.error('Invalid recipient address');
      return;
    }

    if (!sendTokenAmount) {
      toast.error('Amount is required');
      return;
    }

    setSendingToken(true);
    sendToken(extendedAccount, recipient as Address, sendTokenAmount)
      .then((txHistoryData) => {
        // save tranasaction history to local storage and update state
        setTxHistory((prev) => {
          const updatedTxHistory = [...txHistoryData, ...prev];
          setInLocalStorage('txHistory', JSON.stringify(updatedTxHistory.map((tx: TTxHistoryItem) => (serializeTxHistoryItem(tx)))));
          
          return updatedTxHistory;
        });
      })
      .finally(() => setSendingToken(false));
  };

  const handleCreateAutomation = async () => {
    if (!extendedAccount) {
      toast.error('Extended account is not initialized');
    }

    if (!savingsAddress) {
      toast.error('Savings address is required');
      return;
    }

    const args: [Address, bigint] = [savingsAddress as Address, roundUpAmount ?? BigInt(0)];

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
      setPluginState((prev) => ({ ...prev, installing: true }));
      installSavingsPlugin(extendedAccount)
        .then(() => {
          setPluginState((prev) => ({
            ...prev,
            installing: false,
            installed: true,
          }));
        })
        .catch(() => {
          setPluginState((prev) => ({ ...prev, installing: false }));
        });
    }
  };

  const handleUninstallPlugin = async () => {
    if (extendedAccount) {
      removeFromLocalStorage('savingsAddress');
      setPluginState((prev) => ({ ...prev, uninstalling: true }));
      uninstallSavingsPlugin(extendedAccount)
        .then(() => {
          setPluginState((prev) => ({
            ...prev,
            uninstalling: false,
            installed: false,
          }));
          setAutomationState((prev) => ({ ...prev, created: false }));
        })
        .catch(() => {
          setPluginState((prev) => ({ ...prev, uninstalling: false }));
        });
    }
  };

  // Create Modular Smart Account on Mount
  // Savings will be taken from this account
  useEffect(() => {
    async function createMCSA() {
      const modularAccountClient = await getModularAccountAlchemyClient();
      const sca: Address = modularAccountClient.account.address;
      setMsaState((prev) => ({
        ...prev,
        address: sca,
      }));
      const extendedAccount = getExtendedAccount(modularAccountClient);
      setExtendedAccount(extendedAccount);
      const isSPInstalled = await isSavingsPluginInstalled(extendedAccount);
      setPluginState((prev) => ({ ...prev, installed: isSPInstalled }));
    }
    createMCSA();
  }, []);

  useEffect(() => {
    if (mscaState.address) {
      getSavingsAutomations(mscaState.address);
    }
  }, [mscaState.address]);

  // Get wallet balances
  useEffect(() => {
    if (mscaState.address) {
      (async () => {
        if (!mscaState.address) return;
        const balancePromise = getEthBalance(mscaState.address);
        const tokenBalancePromise = getTokenBalance(mscaState.address, USDC);
        const [balance, tokenBalance] = await Promise.all([balancePromise, tokenBalancePromise]);
        setMsaState((prev) => ({ ...prev, balance, tokenBalance: String(tokenBalance) }));
      })();
    }
  }, [mscaState.address, automationState.created, txHistory]);

  useEffect(() => {
    if (walletAddress) {
      (async () => {
        const balancePromise = getEthBalance(walletAddress);
        const tokenBalancePromise = getTokenBalance(walletAddress, USDC);
        const [balance, tokenBalance] = await Promise.all([balancePromise, tokenBalancePromise]);
        setWalletBalance(balance);
        setWalletTokenBalance(String(tokenBalance));
      })();
    }
  }, []);

  useEffect(() => {
    if (savingsAddress) {
      (async () => {
        const tokenBalance = await getTokenBalance(savingsAddress as Address, USDC);
        setSavingsTokenBalance(String(tokenBalance));
      })();
    }
  }, [savingsAddress, txHistory]);

  return (
    <div className='p-6 md:p-12'>
      {/* Chain */}
      <div className='mb-2 flex items-center justify-end gap-2'>
        <p className='text-gray-400'>{viemChain.name}</p>
        <button className='border rounded-[12px] border-gray-300' type='button' onClick={() => setModalOpen(true)}>
          <div className='flex items-center justify-center gap-1'>
            <Image width={16} height={16} className='ml-1 w-4 h-4' src='/Base_Symbol_Blue.svg' alt='wallet' aria-label={'wallet'} />
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca1b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down-icon lucide-chevron-down">
            <title>svggg</title>
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
          
        </button>
      </div>

      {/* Dashboard */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'>
        {/* Top Card 1 */}
        <div className='w-full'>
          <ConnectedAccount
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            walletTokenBalance={walletTokenBalance}
          />
        </div>

        {/* Top Card 2 */}

        <div className='w-full'>
          <SmartAccount mscaState={mscaState} />
        </div>

        {/* Top Card 3 */}
        <div className='w-full'>
          <SavingsAccount
            moduleState={moduleState}
            automationState={automationState}
            savingsTokenBalance={savingsTokenBalance}
            savingsAddress={savingsAddress}
            roundUpAmount={roundUpAmount}
            setSavingsAddress={setSavingsAddress}
            setRoundUpAmount={setRoundUpAmount}
            handleCreateAutomation={handleCreateAutomation}
            handleInstallPlugin={handleInstallPlugin}
          />
        </div>
        {/* Transaction History */}
        <div className='w-full row-start-3 lg:row-start-2 col-span-1 md:col-span-2 2xl:col-span-3 '>
          <TransactionHistory txHistory={txHistory} />
        </div>
        <div className='w-full 2xl:row-span-2'>
          <ActionCenter
            handleInstallPlugin={handleInstallPlugin}
            moduleState={moduleState}
            handleCreateAutomation={handleCreateAutomation}
            automationState={automationState}
            recipient={recipient}
            setRecipient={setRecipient}
            sendTokenAmount={sendTokenAmount}
            setSendTokenAmount={setSendTokenAmount}
            sendingToken={sendingToken}
            sendTokenUO={sendTokenUO}
            handleUninstallPlugin={handleUninstallPlugin}
          />
        </div>
      </div>
    </div>
  );
}
