'use client';

import '@usecapsule/react-sdk/styles.css';
import { CapsuleModal } from '@usecapsule/react-sdk';
import useAuth from '@/hooks/useAuth';
import DashboardPage from './Dashboard';
import SignInPage from './SignIn';
import type { Address } from 'viem';

export default function Page() {
  const { capsuleClient, isModalOpen, setModalOpen, userState } = useAuth();

  return (
    <div className='min-h-[calc(100vh-8px)] w-full h-full flex flex-col items-center justify-center rounded-3xl'>
      {userState.loading ? (
        <video className='w-24 h-24' autoPlay loop muted playsInline>
          <source src='/loader.webm' type='video/webm' />
        </video>
      ) : userState?.walletAddress ? (
        <DashboardPage walletAddress={userState.walletAddress as Address} setModalOpen={setModalOpen} />
      ) : (
        <SignInPage setModalOpen={setModalOpen} />
      )}

      <CapsuleModal
        capsule={capsuleClient}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        disablePhoneLogin={true}
      />
    </div>
  );
}
