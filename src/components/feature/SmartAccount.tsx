'use client';
import { Loader } from '../ui/custom/loader';
import type { TModularSmartAccountState } from '@/types';
import { CopyButton } from '@/components/feature/CopyButton';

export default function SmartAccount({ mscaState }: { mscaState: TModularSmartAccountState }) {

  const loading = mscaState.balance === undefined || mscaState.tokenBalance === undefined || mscaState.address === undefined;

  return (
    <div className='w-full px-5 py-6 min-h-[335px] rounded-[16px] border border-gray-300 text-black'>
      <div className='flex flex-row items-center justify-start gap-2'>
        <p className='text-sm text-[#646464] text-left'>Smart Account</p>
        {loading ? <Loader className='w-4 h-4' /> : null}
      </div>

      {loading ? null :
        <div>
          <div className='mt-5'>
            <p className='text-[#646464] text-lg'>Balance</p>
            <p className='text-[32px] font-bold'>{mscaState.balance === undefined ? '...' : mscaState.balance.slice(0, 6)} ETH</p>
          </div>
          <div className='mt-5'>
            <p className='text-[#646464] text-lg'>Token Balance</p>
            <p className='text-[32px] font-bold'>{String(Number(mscaState.tokenBalance) / 1e6)} USDC</p>
          </div>
          <p className='mt-2 mx-[5px] text-sm text-[#646464]'>Modular Account Address</p>
          <div className='mt-2 mx-[5px] flex items-center justify-between border border-gray-300 rounded-md p-2'>
            <p className='text-sm'>
              {mscaState.address ? mscaState.address.slice(0, 5) + '...' + mscaState.address.slice(-3) : 'loading...'}
            </p>
            <CopyButton text={mscaState.address ?? ''} />
          </div>
        </div>}
    </div>
  );
}
