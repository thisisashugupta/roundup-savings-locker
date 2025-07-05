import { useState, useEffect } from 'react';
import capsuleClient from '@/clients/capsule/capsule';

export default function useAuth() {
  const [userState, setUserState] = useState<{
    walletAddress?: string;
    loading: boolean;
  }>({ loading: true });
  const [isModalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    capsuleClient.isSessionActive().then((res) => {
      if (res) {
        const walletId = capsuleClient.currentWalletIds?.['EVM']?.[0];
        if (walletId) {
          const walletAddress = capsuleClient.wallets[walletId].address;
          setUserState((prev) => ({ ...prev, walletAddress, loading: false }));
        }
      } else {
        console.log('session is not active');
        setUserState({
          walletAddress: undefined,
          loading: false,
        });
      }
    });
  }, [capsuleClient.currentWalletIds?.['EVM']?.[0]]);

  return { capsuleClient, isModalOpen, setModalOpen, userState, setUserState };
}
