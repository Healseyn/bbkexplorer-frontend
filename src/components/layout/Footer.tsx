import Link from 'next/link';
import Image from 'next/image';
import { Github, Twitter, MessageCircle } from 'lucide-react';
import { ApiStatus } from '@/components/ui';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    explorer: [
      { label: 'Blocks', href: '/blocks' },
      { label: 'Transactions', href: '/transactions' },
      { label: 'Masternodes', href: '/masternodes' },
      { label: 'Peers', href: '/peers' },
    ],
    resources: [
      { label: 'API Docs', href: '/docs/api' },
      { label: 'FAQ', href: '/faq' },
      { label: 'About', href: '/about' },
    ],
    community: [
      { label: 'GitHub', href: 'https://github.com/BitBlocksProject/BitBlocks', external: true },
      { label: 'X (Twitter)', href: 'https://x.com/bitblocks', external: true },
      { label: 'Discord', href: 'https://discord.gg/bitblocks', external: true },
    ],
  };

  return (
    <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-secondary)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.png"
                  alt="BitBlocks Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-lg font-bold glow-text">BitBlocks</span>
                <span className="text-lg font-light text-[var(--text-secondary)]"> Explorer</span>
              </div>
            </Link>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              Open-source blockchain explorer for transparent and accessible blockchain data.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/BitBlocksProject/BitBlocks"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://x.com/bitblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://discord.gg/bitblocks"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Explorer Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
              Explorer
            </h3>
            <ul className="space-y-3">
              {footerLinks.explorer.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Links */}
          <div>
            <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4 uppercase tracking-wider">
              Community
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-[var(--border-primary)]">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[var(--text-muted)]">
              © {currentYear} BitBlocks Explorer.
            </p>
            <div className="flex items-center gap-4">
              <ApiStatus />
              <Link
                href="/privacy"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors duration-200"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

