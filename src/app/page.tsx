"use client";

import "@usecapsule/react-sdk/styles.css";
import { CapsuleModal } from "@usecapsule/react-sdk";
import useAuth from "@/hooks/useAuth";
import DashboardPage from "./Dashboard";
import SignInPage from "./SignIn";
import { Address } from "viem";

export default function Page() {
  const { capsuleClient, isModalOpen, setModalOpen, userState } = useAuth();

  return (
    <>
      <div className="bg-[#272727] h-screen flex flex-col items-center justify-center">
        {userState.loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <video className="w-24 h-24" autoPlay loop muted playsInline>
              <source src="/loader.webm" type="video/webm" />
            </video>
          </div>
        ) : (
          <>
            {userState?.walletAddress ? (
              <DashboardPage
                walletAddress={userState.walletAddress as Address}
                setModalOpen={setModalOpen}
              />
            ) : (
              <SignInPage setModalOpen={setModalOpen} userState={userState} />
            )}
          </>
        )}
      </div>

      <CapsuleModal
        capsule={capsuleClient}
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        disablePhoneLogin={true}
      />
    </>
  );
}
