import { TPluginState, TAutomationState } from '@/types';
import type { ChangeEvent } from 'react';
import { Address } from 'viem';

export default function SavingsAccount({
  moduleState,
  automationState,
  savingsTokenBalance,
  savingsAddress,
  roundUpAmount,
  setSavingsAddress,
  setRoundUpAmount,
  handleCreateAutomation,
  handleInstallPlugin,
}: {
  moduleState: TPluginState;
  automationState: TAutomationState;
  savingsTokenBalance: string;
  savingsAddress: string;
  roundUpAmount: number;
  setSavingsAddress: (address: string) => void;
  setRoundUpAmount: (amount: number) => void;
  handleCreateAutomation: () => void;
  handleInstallPlugin: () => void;
}) {
  return (
    <div className='w-full h-full px-5 py-6 min-h-[335px] rounded-[16px] flex flex-col justify-between border border-gray-300 text-black bg-[#dbe3ce]'>
      <div>
        <p className='text-sm text-[#646464]'>Savings Account</p>
        {moduleState.installed ? (
          <div className='mt-[24px] mb-[24px]'>
            {automationState.created && (
              <div className='mt-4'>
                <p className='text-[#646464] text-lg'>Token Balance</p>
                <p className='text-[32px] font-bold'>{String(Number(savingsTokenBalance) / 1e6)} USDC</p>
              </div>
            )}
            <p className='mt-6 text-sm text-[#646464]'>
              {automationState.created ? 'Savings Address' : 'Enter Savings Address'}
            </p>
            <input
              className='w-full mt-1 bg-[#dbe3ce] border border-gray-400 rounded-md px-2 py-1'
              placeholder='0x...'
              type='text'
              value={savingsAddress}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSavingsAddress(e.target.value as Address)}
              readOnly={automationState.created}
            />
            <p className='mt-2 text-sm text-[#646464]'>
              {automationState.created ? 'Roundup Amount' : 'Enter Roundup Amount'}
            </p>
            <input
              className='w-full mt-1 bg-[#dbe3ce] border border-gray-400 rounded-md px-2 py-1'
              type='number'
              value={roundUpAmount}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRoundUpAmount(Number(e.target.value))}
              readOnly={automationState.created}
            />
          </div>
        ) : (
          <div className='my-[90px] flex flex-col items-center justify-center'>
            <p className='px-4 text-sm text-center'>Install Locker Savings Plugin for saving your funds.</p>
          </div>
        )}
      </div>

      {!automationState.created && (
        <button
        type='button'
          className='w-full min-w-[0px] h-[46px] bg-[#207f68] px-3 py-2 rounded-xl text-base font-bold text-[#def1ee]'
          onClick={moduleState.installed ? handleCreateAutomation : handleInstallPlugin}
        >
          {moduleState.installed
            ? automationState.creating
              ? 'Creating Automation'
              : 'Create Automation'
            : moduleState.installing
              ? 'Installing Plugin'
              : 'Install Plugin'}
        </button>
      )}
    </div>
  );
}
