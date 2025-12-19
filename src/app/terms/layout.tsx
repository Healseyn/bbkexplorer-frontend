import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | BitBlocks Explorer',
  description: 'Terms of Service for BitBlocks Explorer - Read our terms and conditions for using the blockchain explorer.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

