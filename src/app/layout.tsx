import type { Metadata } from 'next';
import '@/styles/globals.css';
import { Toaster } from 'sonner';
import { GeistSans } from 'geist/font/sans';

export const metadata: Metadata = {
  title: 'RoundUp Savings | Locker',
  description: 'RoundUp Savings - Locker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${GeistSans.className} antialiased bg-[#fcffff] p-[4px]`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
