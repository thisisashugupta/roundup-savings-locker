import Link from 'next/link';
import { blockExplorer } from '@/config';
import type { TTxHistoryItem } from '@/types';
import { minifyAddress } from '@/utils/address';

export default function TransactionHistory({ txHistory }: { txHistory: TTxHistoryItem[] }) {
  return (
    <div className='h-full w-full px-5 py-6 bg-[#1E1E1E] min-h-[363px] rounded-[16px]'>
      <p className='text-lg text-[#646464] text-left'>Transaction History</p>
      <div className='mt-5'>
        {txHistory.map((tx, index) => (
          <Link href={`${blockExplorer}/tx/${tx.hash}`} target='_blank' key={`txHistory-${index}`}>
            <div className='flex md:flex-row flex-col items-center justify-between border border-[#272727] rounded-md px-5 py-3 mb-2 gap-1'>
              <div>
                <p className='text-white text-sm'>
                  From: <span className='font-semibold text-base mr-4'>{minifyAddress(tx.from)}</span>
                  To: <span className='font-semibold text-base mr-1'>{minifyAddress(tx.to)}</span>
                </p>
              </div>

              <p className='text-white text-sm'>
                Amount: <span className='font-semibold text-base mr-1'>{String(Number(tx.amount) / 1e6)} USDC</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
