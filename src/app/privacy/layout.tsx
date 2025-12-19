import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | BitBlocks Explorer',
  description: 'Privacy Policy for BitBlocks Explorer - Learn how we handle your data and protect your privacy.',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

