'use client';
import { CopyButton } from './CopyButton';

export default function ConnectedAccount({
  walletAddress,
  walletBalance,
  walletTokenBalance,
}: {
  walletAddress: string;
  walletBalance: string;
  walletTokenBalance: string;
}) {
  return (
    <div className='w-full px-5 py-6 min-h-[335px] rounded-[16px] border border-gray-300 text-black'>
      <div className='grid grid-cols-1 md:grid-cols-2'>
        <p className='text-sm text-[#646464] text-left'>Connected Account</p>
      </div>
      {/* <div className="mt-5 grid grid-cols-2"> */}
      <div className='mt-5'>
        <p className='text-[#646464] text-lg'>Balance</p>
        <p className='text-[32px] font-bold'>{walletBalance.slice(0, 6)} ETH</p>
      </div>
      <div className='mt-5'>
        <p className='text-[#646464] text-lg'>Token Balance</p>
        <p className='text-[32px] font-bold'>{String(Number(walletTokenBalance) / 1e6)} USDC</p>
      </div>
      {/* <img className="ml-auto" src="/fund.svg" /> */}
      {/* </div> */}
      <p className='mt-2 mx-[5px] text-sm text-[#646464]'>Wallet Address</p>
      <div className='mt-2 mx-[5px] flex items-center justify-between border border-gray-300 rounded-md p-2'>
        <p className='text-sm'>
          {walletAddress ? walletAddress?.slice(0, 5) + '...' + walletAddress?.slice(-3) : 'loading...'}
        </p>
        <CopyButton text={walletAddress} />
      </div>
    </div>
  );
}
