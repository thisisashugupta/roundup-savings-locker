# 🧠 Roundup Savings

**Roundup Savings** is a minimal web app that demonstrates how to install Locker’s *round-up savings module* on a smart account using Account Abstraction (ERC‑4337/6900). It lets users connect a wallet, deploy a smart account, and install a savings automation plugin — enabling automatic micro-savings on every transaction.

Built with **Next.js**, **Viem**, **Capsule**, and **AccountKit**, the project integrates modular accounts and Locker's ERC‑6900 savings logic.

## 🚀 Features

* 🔐 Connect Ethereum wallet via Capsule
* 💰 Install Locker's savings plugin (ERC-6900)
* 📊 View wallet and smart account balances

## 🛠️ Setup

### 1. Clone the repo

```bash
git clone https://github.com/thisisashugupta/roundup-savings-locker.git
cd roundup-savings-locker
```

### 2. Install dependencies

```bash
yarn install  # or npm install
```

### 3. Create a `.env.local` file

Copy the sample:

```bash
cp .env-sample .env.local
```

Fill in with your credentials:

```env
NEXT_PUBLIC_CAPSULE_API_KEY=your_capsule_key
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
NEXT_PUBLIC_ALCHEMY_SEPOLIA_RPC_URL=https://...
NEXT_PUBLIC_ALCHEMY_BASE_SEPOLIA_RPC_URL=https://...
```

### 4. Run the app locally

```bash
yarn dev
```

Go to [http://localhost:3000](http://localhost:3000)

## 🔗 Tech Stack

* **Frontend:** Next.js 14, React, Tailwind CSS
* **Wallet:** Capsule SDK
* **Blockchain:** Alchemy + Viem, ERC-6900 plugins
* **Smart Modules:** Locker savings automation

## 📄 License

MIT
