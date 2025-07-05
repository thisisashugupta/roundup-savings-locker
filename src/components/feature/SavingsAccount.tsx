import type { TPluginState, TAutomationState } from '@/types';
import type { ChangeEvent } from 'react';
import type { Address } from 'viem';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

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
  roundUpAmount: bigint | undefined;
  setSavingsAddress: (address: string) => void;
  setRoundUpAmount: (amount: bigint | undefined) => void;
  handleCreateAutomation: () => void;
  handleInstallPlugin: () => void;
}) {
  const roundUpAmountValue = roundUpAmount === undefined ? '' : String(Number(roundUpAmount) / 1e6);
  
  return (
    <div className='w-full h-full px-5 py-6 min-h-[335px] rounded-[16px] flex flex-col justify-between text-black bg-[#dbe3ce]'>
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
            <Input
              className='border-[#646464]/50'
              placeholder='0x...'
              type='text'
              value={savingsAddress}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSavingsAddress(e.target.value as Address)}
              readOnly={automationState.created}
            />
            <p className='mt-2 text-sm text-[#646464]'>
              {automationState.created ? 'Roundup Amount' : 'Enter Roundup Amount'}
            </p>
            <Input
              className='border-[#646464]/50'
              type='number'
              value={roundUpAmountValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {

                if (e.target.value === '') {
                  setRoundUpAmount(BigInt(0));
                  return;
                }

                const numberValue = Number(e.target.value);

                if (Number.isNaN(numberValue)) {
                  setRoundUpAmount(BigInt(0));
                  return;
                }

                // 6 decimal places for USDC
                if (Number(e.target.value) < 1/1e6) {
                  setRoundUpAmount(BigInt(0));
                  return;
                }

                const bigIntValue = BigInt(Math.floor(numberValue * 1e6));
                setRoundUpAmount(bigIntValue);
              }}
              readOnly={automationState.created}
            />
          </div>
        ) : (
          <div className='my-[90px] flex flex-col items-center justify-center'>
            <p className='px-4 text-xl text-center'>Install Savings Plugin<br/>and start saving</p>
          </div>
        )}
      </div>

      {!automationState.created && (
        <Button
          type='button'
          className='w-full'
          onClick={moduleState.installed ? handleCreateAutomation : handleInstallPlugin}
          disabled={moduleState.installing || automationState.creating}
        >
          {moduleState.installed
            ? automationState.creating
              ? 'Creating Automation...'
              : 'Create Automation'
            : moduleState.installing
              ? 'Installing Plugin...'
              : 'Install Plugin'}
        </Button>
      )}
    </div>
  );
}
