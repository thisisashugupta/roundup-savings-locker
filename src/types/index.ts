import type { Address } from 'viem';

export type TPluginState = {
  loading: boolean;
  installing: boolean;
  installed: boolean;
  uninstalling: boolean;
};

export type TAutomationState = {
  creating: boolean;
  created: boolean;
};

export type TTxHistoryItem = {
  amount: bigint;
  from: string;
  to: string;
  hash: string;
};

export type TModularSmartAccountState = {
  address: Address | undefined;
  balance: string | undefined;
  tokenBalance: string | undefined;
};
