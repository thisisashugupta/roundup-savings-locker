'use client';
import { TPluginState, TAutomationState } from '@/types';
import type { Dispatch, SetStateAction } from 'react';
import type { ChangeEvent } from 'react';
import type { Address } from 'viem';

export default function ActionCenter({
  handleInstallPlugin,
  moduleState,
  handleCreateAutomation,
  automationState,
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
  sendTokenAmount: bigint;
  setSendTokenAmount: Dispatch<SetStateAction<bigint>>;
  sendingToken: boolean;
  sendTokenUO: () => void;
  handleUninstallPlugin: () => void;
}) {
  return (
    <div className='h-full w-full p-5 bg-[#1E1E1E] rounded-[16px] flex flex-col justify-between gap-5'>
      <div>
        <p className='text-lg text-[#646464] text-left'>Send USDC from Smart Account</p>
        {/* Send UserOp */}
        <div>
          <div className='mt-5 mb-1'>
            <p className='text-sm text-[#646464]'>Enter Recipient Address</p>
            <input
              className='w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white'
              placeholder='0x...'
              type='text'
              value={recipient}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setRecipient(e.target.value as Address)}
            />
          </div>
          <div className='mt-5 mb-1'>
            <p className='text-sm text-[#646464]'>Enter Amount (in decimals)</p>
            <input
              className='w-full mt-1 bg-[#1E1E1E] border border-[#272727] rounded-md px-2 py-1 text-white'
              type='number'
              value={Number(sendTokenAmount)}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSendTokenAmount(BigInt(e.target.value))}
            />
          </div>
          <button
            className='mt-4 w-full min-w-[0px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold'
            onClick={sendTokenUO}
          >
            {sendingToken ? 'Sending Token...' : 'Send Token'}
          </button>
        </div>
      </div>

      {/* Uninstall Plugin */}
      {moduleState.installed ? (
        <button
          className='w-full min-w-[0px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold'
          onClick={handleUninstallPlugin}
        >
          {moduleState.uninstalling ? 'Uninstalling Plugin...' : 'Uninstall Plugin'}
        </button>
      ) : null}
    </div>
  );
}
