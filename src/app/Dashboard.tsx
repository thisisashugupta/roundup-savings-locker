'use client';

import type { Dispatch, SetStateAction } from 'react';
import { toast } from 'sonner';
import type { Address } from 'viem';
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
  const { removeFromLocalStorage, getFromLocalStorage } = useLocalStorage();

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
  const [roundUpAmount, setRoundUpAmount] = useState<number>(1000000);
  const [recipient, setRecipient] = useState<Address | string>('');

  const [sendingToken, setSendingToken] = useState<boolean>(false);
  const [sendTokenAmount, setSendTokenAmount] = useState<bigint>(BigInt(1500000));
  const [txHistory, setTxHistory] = useState<TTxHistoryItem[]>([]);

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
      toast.error('Invalid receipient address');
      return;
    }

    setSendingToken(true);
    sendToken(extendedAccount, recipient as Address, sendTokenAmount)
      .then((txHistoryData) => {
        setTxHistory((prev) => [...txHistoryData, ...prev]);
      })
      .finally(() => setSendingToken(false));
  };

  const handleCreateAutomation = async () => {
    if (!extendedAccount) {
      toast.error('Extended Account not initialized');
    }

    if (!savingsAddress) {
      toast.error('Savings Address is required');
      return;
    }

    const args: [Address, bigint] = [savingsAddress as Address, BigInt(1000000)];

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
        <p>{viemChain.name}</p>
        <button type='button' onClick={() => setModalOpen(true)}>
          <img className='ml-auto' src='/chain-selector.svg' alt='wallet' aria-label={'wallet'} />
        </button>
      </div>

      {/* Dashboard */}
      <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4'>
        {/* Top Card 1 */}
        <div className='w-full w-[330px]'>
          <ConnectedAccount
            walletAddress={walletAddress}
            walletBalance={walletBalance}
            walletTokenBalance={walletTokenBalance}
          />
        </div>

        {/* Top Card 2 */}

        <div className='w-full w-[330px]'>
          <SmartAccount mscaState={mscaState} />
        </div>

        {/* Top Card 3 */}
        <div className='w-full w-[330px]'>
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
        <div className='w-full 2xl:row-span-2 w-[330px]'>
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
