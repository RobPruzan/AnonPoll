import './globals.css';
import { Inter } from 'next/font/google';

import { twMerge } from 'tailwind-merge';
import { ThemeProvider } from '@/providers/ThemeProvider';
import SocketProvider from '@/providers/SocketProvider';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';
import ReduxProvider from '@/providers/ReduxProvider';
import UserProvider from '@/providers/UserProvider';
import RootProvider from '@/providers/RootProvider';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Anon Polls',
  description: 'Easy polls, anonymously',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootProvider>
      <html lang="en">
        <body
          className={twMerge(
            inter.className,
            'h-screen w-full dark flex flex-col '
          )}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </RootProvider>
  );
}
