'use client';
import { toast } from 'sonner';
import { Loader } from '../ui/custom/loader';
import { TModularSmartAccountState } from '@/types';

export default function SmartAccount({ mscaState }: { mscaState: TModularSmartAccountState }) {
  if (!mscaState.address || !mscaState.balance || !mscaState.tokenBalance) {
    return (
      <div className='w-full px-5 py-6 min-h-[335px] rounded-[16px] border border-gray-300'>
        <div className='grid grid-cols-1 md:grid-cols-2'>
          <p className='text-sm text-[#646464] text-left'>Smart Account</p>
        </div>

        <div className='h-full w-full flex items-center justify-center'>
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className='w-full px-5 py-6 min-h-[335px] rounded-[16px] border border-gray-300 text-black'>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <p className='text-sm text-[#646464] text-left'>Smart Account</p>
      </div>
      <div className='mt-5'>
        <p className='text-[#646464] text-lg'>Balance</p>
        <p className='text-[32px] font-bold'>{mscaState.balance.slice(0, 6)} ETH</p>
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
        <button
        type='button'
          onClick={() => {
            navigator.clipboard.writeText(mscaState.address ?? '');
            toast('Copied to clipboard');
          }}
        >
          <img src='/copy.svg' />
        </button>
      </div>
    </div>
  );
}
