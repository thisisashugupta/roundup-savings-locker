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
import Link from 'next/link';

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

  let step = 0;
  let instructions: string | null = null;
  let instructions2: string | null = null;

  console.log('moduleState', moduleState)

  // Check that connected account and smart account are available
  if (!!walletAddress && !!mscaState.address && mscaState.balance !== undefined && mscaState.tokenBalance !== undefined) {

    // Check if the msca wallet has native eth balance
    if (mscaState.balance === '0') {
      step = 1;
      instructions = 'Your Smart Account is ready, but it has no balance. Please send some test ETH to your Modular Smart Account to get started.';
    // Check if the msca wallet has usdc token balance
    } else if (mscaState.tokenBalance === '0') {
      step = 2;
      instructions = 'You also need to add some USDC in your Smart Account.';
    } else if (!moduleState.installed) {
      step = 3;
      instructions = "Awesome! Now Install Plugin to install Locker's ERC-6900 Savings Module.";
    } else if (!automationState.created) {
      step = 4;
      instructions = "Now enter an address where you want to recieve all your roundup savings. Default roundup amount is 1 USDC.";
    } else {
      step = 5;
      instructions = "Setup is complete! You can now send USDC tokens to any address from your smart account, and the roundup savings will be sent to your Savings Account.";
      instructions2 = "You can click on transactions in the history to view them on the block explorer.";
    }




    // if (!moduleState.installed) {
    //   step = 1;
    //   instructions = 'To get started, please install the RoundUp Savings Plugin to your Modular Smart Account.';
    // } else if (!automationState.created) {
    //   step = 2;
    //   instructions = 'Next, create a savings account to start saving your spare change.';
    // } else if (!savingsAddress) {
    //   step = 3;
    //   instructions = 'You can now create a savings account and set up automation to save your spare change.';
    // } else {
    //   step = 4;
    //   instructions = 'You can now send tokens, view your transaction history, and manage your savings account.';
    // }
  }

  

  return (
    <div className='p-6 md:p-12'>

      <div className='flex items-center justify-start gap-1'>
        <p>{instructions}</p>
        {step === 1 ? <Link className='underline underline-offset-1 text-blue-600' href='https://www.alchemy.com/faucets/base-sepolia' target='_blank'>Alchemy Faucet</Link> : null}
        {step === 2 ? <Link className='underline underline-offset-1 text-blue-600' href='https://faucet.circle.com/' target='_blank'>Circle Faucet</Link> : null}
      </div>
      {instructions2 ? <p>{instructions2}</p> : null}
      
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
