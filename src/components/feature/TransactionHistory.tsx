import Link from 'next/link';
import { blockExplorer } from '@/config';
import type { TTxHistoryItem } from '@/types';
import { minifyAddress } from '@/utils/address';

export default function TransactionHistory({ txHistory }: { txHistory: TTxHistoryItem[] }) {

  const isEmpty = txHistory.length === 0;

  return (
    <div className='h-full w-full px-5 py-6 min-h-[363px] rounded-[16px] border border-gray-300 text-black'>
      <p className='text-lg text-[#646464] text-left'>Transaction History</p>
      
      {isEmpty ? <div className='flex flex-col items-center justify-center h-full w-full'>
        <p className='text-base text-center'>No recent transactions</p>
      </div> : <div className='mt-5'>
      {txHistory.map((tx, index) => (
          <Link href={`${blockExplorer}/tx/${tx.hash}`} target='_blank' key={`txHistory-${index}-${Math.random()}`}>
            <div className='hover:bg-[#207f68]/10 flex md:flex-row flex-col items-center justify-between border border-gray-300 rounded-md px-5 py-3 mb-2 gap-1'>
              <div>
                <p className='text-sm'>
                  From: <span className='font-semibold text-base mr-4'>{minifyAddress(tx.from)}</span>
                  To: <span className='font-semibold text-base mr-1'>{minifyAddress(tx.to)}</span>
                </p>
              </div>

              <p className='text-sm'>
                Amount: <span className='font-semibold text-base mr-1'>{String(Number(tx.amount) / 1e6)} USDC</span>
              </p>
            </div>
          </Link>
        ))}
      </div>}
    </div>
  );
}
