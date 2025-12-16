import type { Metadata } from "next";
import "./globals.css";
import { Header, Footer } from "@/components/layout";
import QueryProvider from "@/providers/QueryProvider";

export const metadata: Metadata = {
  title: "BitBlocks Explorer | BBK Blockchain Explorer",
  description: "Explore the BitBlocks blockchain (BBK) with BitBlocks Explorer - an open source block explorer providing transparent access to masternodes, blocks, transactions, and addresses.",
  keywords: ["blockchain", "explorer", "bitblocks", "bbk", "masternodes", "blocks", "transactions", "open source"],
  authors: [{ name: "BitBlocks Team" }],
  openGraph: {
    title: "BitBlocks Explorer",
    description: "BitBlocks (BBK) Blockchain Explorer",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-grid-pattern min-h-screen flex flex-col">
        <QueryProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
