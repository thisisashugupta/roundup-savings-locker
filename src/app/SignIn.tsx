"use client";

import "@usecapsule/react-sdk/styles.css";
import Link from "next/link";
import { paths } from "@/constants/paths";

export default function SignIn({
  setModalOpen,
  userState,
}: {
  setModalOpen: any;
  userState: any;
}) {
  return (
    <>
      <p className="font-bold text-[40px]">
        Round Up <span className="text-[#8FC346]">Savings</span>
      </p>
      <p className="text-center max-w-[500px] mt-8 text-[#C1C1C1] font-bold text-[18px]">
        Save a little USDC every time you use your ERC-6900 compatible ERC-4337
        wallet.
      </p>
      <button
        className="mt-[48px] w-fit min-w-[230px] h-[46px] bg-[#8FC346] px-3 py-2 rounded-xl text-base text-black font-bold"
        onClick={() => setModalOpen(true)}
      >
        {userState?.walletAddress
          ? userState.walletAddress.slice(0, 5) +
            "..." +
            userState.walletAddress.slice(-5)
          : "Sign In"}
      </button>
      <div className="mt-[15px] text-sm text-[#707070] flex space-x-4 select-none">
        <Link href={paths.DOCS} target="_blank">
          <p>Documentation</p>
        </Link>
        <Link href={paths.GITHUB} target="_blank">
          <p>Code</p>
        </Link>
      </div>
    </>
  );
}
