'use client';
import type { TPluginState, TAutomationState } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import type { ChangeEvent } from 'react';
import type { Address } from 'viem';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function ActionCenter({
  moduleState,
  recipient,
  setRecipient,
  sendTokenAmount,
  setSendTokenAmount,
  sendingToken,
  sendTokenUO,
  handleUninstallPlugin,
}: {
  handleInstallPlugin: () => void;
  moduleState: TPluginState;
  handleCreateAutomation: () => void;
  automationState: TAutomationState;
  recipient: string;
  setRecipient: Dispatch<SetStateAction<string>>;
  sendTokenAmount: bigint | undefined;
  setSendTokenAmount: Dispatch<SetStateAction<bigint | undefined>>;
  sendingToken: boolean;
  sendTokenUO: () => void;
  handleUninstallPlugin: () => void;
}) {
  const sendTokenAmountValue = sendTokenAmount === undefined ? '' : String(Number(sendTokenAmount) / 1e6);

  return (
    <div className='h-full w-full p-5 rounded-[16px] flex flex-col justify-between gap-5 border border-gray-300 text-black'>
      <div>
        <p className='text-lg text-[#646464] text-left'>Send USDC</p>
        <p className='text-xs text-[#646464] text-left leading-none'>from Smart Account</p>
        {/* Send UserOp */}
        <div>
          <div className='mt-5 mb-1'>
            <p className='text-sm text-[#646464]'>Recipient</p>
            <Input
              className='w-full mt-1 border border-gray-300 rounded-md px-2 py-1'
              placeholder='0x...'
              type='text'
              value={recipient}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value as Address)}
            />
          </div>
          <div className='mt-5 mb-1'>
            <p className='text-sm text-[#646464]'>Amount</p>
            <Input
              className='w-full mt-1 border border-gray-300 rounded-md px-2 py-1'
              type='number'
              value={sendTokenAmountValue}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {

                if (e.target.value === '') {
                  setSendTokenAmount(BigInt(0));
                  return;
                }

                const numberValue = Number(e.target.value);

                if (Number.isNaN(numberValue)) {
                  setSendTokenAmount(BigInt(0));
                  return;
                }

                // 6 decimal places for USDC
                if (Number(e.target.value) < 1/1e6) {
                  setSendTokenAmount(BigInt(0));
                  return;
                }

                const bigIntValue = BigInt(Math.floor(numberValue * 1e6));
                setSendTokenAmount(bigIntValue);
              }}
            />
          </div>
          {moduleState.installed && <Button
            type='button'
            className='mt-4 w-full'
            onClick={sendTokenUO}
            disabled={sendingToken}
          >
            {sendingToken ? 'Sending Token...' : 'Send Token'}
          </Button>}
        </div>
      </div>

      {/* Uninstall Plugin */}
      {moduleState.installed ? (
        <Button
          type='button'
          
          onClick={handleUninstallPlugin}
        >
          {moduleState.uninstalling ? 'Uninstalling Plugin...' : 'Uninstall Plugin'}
        </Button>
      ) : (<Button
            type='button'
            className='mt-4'
            onClick={sendTokenUO}
            disabled={sendingToken}
          >
            {sendingToken ? 'Sending Token...' : 'Send Token'}
          </Button>)}
      
    </div>
  );
}
