'use client';

import '@usecapsule/react-sdk/styles.css';
// import Image from 'next/image';
import Link from 'next/link';
import type { Dispatch, SetStateAction } from 'react';
import { paths } from '@/constants/paths';

export default function SignIn({ setModalOpen }: { setModalOpen: Dispatch<SetStateAction<boolean>> }) {
  return (
    <div className='w-full h-[calc(100vh-8px)] flex flex-col items-center justify-center bg-[#002712] rounded-3xl'>
      <p className='mx-4 font-bold text-[48px] text-center leading-[1.25]'>
        <span className='text-[#fdffff]'>RoundUp </span>
        <span className='text-[#8ddc42]'>Savings</span>
      </p>
      <p className='mx-8 text-center max-w-[500px] mt-8 text-[##fdffff] font-light text-[18px]'>
        Save a little USDC every time you use your ERC-6900 compatible ERC-4337 wallet
      </p>
      <button
        className='mt-[48px] w-fit min-w-[230px] h-[46px] bg-[#8ddc42] px-3 py-2 rounded-xl text-base text-black font-medium'
        type='button'
        onClick={() => setModalOpen(true)}
      >
        Sign in
      </button>

      <div className='mt-[15px] text-sm text-[#707070] flex space-x-4 select-none'>
        <Link className='hover:text-[#C1C1C1] transition-colors' href={paths.DOCS} target='_blank'>
          <p>Documentation</p>
        </Link>
        <Link className='hover:text-[#C1C1C1] transition-colors' href={paths.GITHUB} target='_blank'>
          <p>Code</p>
        </Link>
      </div>

      {/* <div className='absolute bottom-0 bg-white/20 px-3 py-2 rounded-t-lg'>
        <Link href={paths.LOCKER_MONEY} target='_blank' className='flex'>
          <p className='text-black font-medium'>Powered by</p>
          <Image src='/logoLockerDarkLetters.svg' alt='Locker' width={100} height={30} className='ml-2' />
        </Link>
      </div> */}
    </div>
  );
}
