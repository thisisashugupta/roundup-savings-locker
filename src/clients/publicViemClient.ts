import { http, createPublicClient } from 'viem';
import { viemChain } from '@/config/chains';

export const publicClient = createPublicClient({
  chain: viemChain,
  transport: http(),
});
