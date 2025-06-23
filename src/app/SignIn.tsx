'use client';

import '@usecapsule/react-sdk/styles.css';
import Link from 'next/link';
import Image from 'next/image';
import { paths } from '@/constants/paths';

export default function SignIn({ setModalOpen, userState }: { setModalOpen: any; userState: any }) {
  return (
    <div className='relative w-full h-full flex flex-col items-center justify-center'>
      <p className='font-bold text-[40px]'>
        <span className='text-[#C1C1C1]'>Round Up </span>
        <span className='text-[#8FC346]'>Savings</span>
      </p>
      <p className='text-center max-w-[500px] mt-8 text-[#C1C1C1] font-bold text-[18px]'>
        Save a little USDC every time you use your ERC-6900 compatible ERC-4337 wallet
      </p>
      <button
        className='mt-[48px] w-fit min-w-[0px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold'
        onClick={() => setModalOpen(true)}
      >
        {userState?.walletAddress
          ? userState.walletAddress.slice(0, 5) + '...' + userState.walletAddress.slice(-5)
          : 'Sign In'}
      </button>
      <div className='mt-[15px] text-sm text-[#707070] flex space-x-4 select-none'>
        <Link className='hover:text-[#C1C1C1] transition-colors' href={paths.DOCS} target='_blank'>
          <p>Documentation</p>
        </Link>
        <Link className='hover:text-[#C1C1C1] transition-colors' href={paths.GITHUB} target='_blank'>
          <p>Code</p>
        </Link>
      </div>

      <div className='absolute bottom-0 flex bg-white/20 px-3 py-2 rounded-t-lg'>
        <p className='text-black font-medium'>Powered by</p>
        <Image src='/logoLockerDarkLetters.svg' alt='Locker' width={100} height={30} className='ml-2' />
      </div>
    </div>
  );
}
