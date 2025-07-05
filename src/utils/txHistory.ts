import type { TTxHistoryItem, TTxHistoryItemForLocalStorage } from "@/types";

const isServer = typeof window === 'undefined';

export function getTxHistoryFromLocalStorage(): TTxHistoryItem[] {
  if (isServer) return [];

  const txHistory = localStorage.getItem('txHistory');
  if (!txHistory) return [];

  try {
    const parsedHistory = JSON.parse(txHistory) as TTxHistoryItemForLocalStorage[];
    return parsedHistory.map(tx => deserializeTxHistoryItem(tx));
  } catch (error) {
    console.error('Error parsing transaction history from localStorage:', error);
    return [];
  }
}

export function serializeTxHistoryItem(item: TTxHistoryItem): TTxHistoryItemForLocalStorage {
  return {
    amount: item.amount.toString(),
    from: item.from,
    to: item.to,
    hash: item.hash,
  };
}

export function deserializeTxHistoryItem(item: TTxHistoryItemForLocalStorage): TTxHistoryItem {
  return {
    amount: BigInt(item.amount),
    from: item.from,
    to: item.to,
    hash: item.hash,
  };
}