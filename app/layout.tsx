import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: {
    default: 'JudgeLite',
    template: '%s | JudgeLite',
  },
  description: 'A lightweight competitive programming platform powered by Judge0.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="bg-slate-950 text-slate-100 min-h-screen antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
