
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import BottomNav from '@/components/BottomNav';
import { clsx } from 'clsx';
import { UserProvider } from '@/context/UserContext';
import { BrandingProvider } from '@/context/BrandingContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Store',
  description: 'Your one-stop destination for quality products',
};


import PecafooNavbar from '@/components/PecafooNavbar';
import Footer from '@/components/Footer';
import { ToastProvider } from '@/context/ToastContext';
import Toaster from '@/components/ui/Toaster';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={clsx(inter.className, "bg-peca-bg text-peca-text antialiased min-h-screen flex flex-col font-sans")}>
        <BrandingProvider>
          <UserProvider>
            <ToastProvider>
              <WishlistProvider>
                <CartProvider>
                  <PecafooNavbar />
                  <main className="flex-1 pb-16 md:pb-0">
                    {children}
                  </main>
                  <Footer />
                  <BottomNav />
                  <Toaster />
                </CartProvider>
              </WishlistProvider>
            </ToastProvider>
          </UserProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}
