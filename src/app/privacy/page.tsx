'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText, Database, Cookie } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      icon: Shield,
      title: 'Information We Collect',
      content: [
        'BitBlocks Explorer is an open-source blockchain explorer that provides public blockchain data. We collect minimal information necessary to provide our services:',
        '• Public blockchain data (blocks, transactions, addresses) - This is publicly available on the blockchain',
        '• Usage analytics (anonymized) - To improve our service, we may collect anonymized usage statistics',
        '• Server logs - Standard web server logs for security and debugging purposes',
        'We do not collect personal information such as names, email addresses, or IP addresses in a personally identifiable manner.',
      ],
    },
    {
      icon: Lock,
      title: 'How We Use Information',
      content: [
        'The information we collect is used solely for:',
        '• Providing blockchain exploration services',
        '• Improving the performance and reliability of our platform',
        '• Ensuring security and preventing abuse',
        '• Analyzing usage patterns to enhance user experience',
        'We do not sell, rent, or share your information with third parties for marketing purposes.',
      ],
    },
    {
      icon: Eye,
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures to protect the data we process:',
        '• Secure server infrastructure',
        '• Regular security updates and patches',
        '• Access controls and authentication',
        '• Monitoring and logging for security events',
        'However, please note that blockchain data is inherently public, and any information on the blockchain is accessible to anyone.',
      ],
    },
    {
      icon: Database,
      title: 'Blockchain Data',
      content: [
        'BitBlocks Explorer displays publicly available blockchain data. This includes:',
        '• Block information (hashes, timestamps, transactions)',
        '• Transaction details (amounts, addresses, fees)',
        '• Address balances and transaction history',
        '• Masternode information',
        'All this data is already public on the blockchain and accessible through various means. We simply provide a user-friendly interface to access this information.',
      ],
    },
    {
      icon: Cookie,
      title: 'Cookies and Tracking',
      content: [
        'We may use cookies and similar technologies to:',
        '• Maintain session state',
        '• Remember user preferences',
        '• Analyze site usage (anonymized)',
        'You can control cookies through your browser settings. However, disabling cookies may affect some functionality of the site.',
      ],
    },
    {
      icon: FileText,
      title: 'Your Rights',
      content: [
        'As a user of BitBlocks Explorer, you have the right to:',
        '• Access public blockchain data (which is already public)',
        '• Understand what data we collect and how we use it',
        '• Request information about our data practices',
        'Since we primarily display public blockchain data and collect minimal personal information, most data displayed is inherently public and cannot be removed.',
      ],
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="glow-text">Privacy</span>{' '}
              <span className="text-[var(--text-primary)]">Policy</span>
            </h1>
            <p className="text-lg text-[var(--text-secondary)]">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <div className="card p-6 mb-6">
            <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
              Welcome to BitBlocks Explorer. This Privacy Policy explains how we handle information
              when you use our blockchain explorer service. We are committed to transparency and
              protecting your privacy.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Important:</strong> BitBlocks Explorer
              is an open-source tool that displays publicly available blockchain data. All blockchain
              data is inherently public and accessible to anyone on the network.
            </p>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              className="card p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-lg bg-[var(--bg-tertiary)] text-[var(--accent-primary)]">
                  <section.icon className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold text-[var(--text-primary)] flex-1">
                  {section.title}
                </h2>
              </div>
              <div className="space-y-3">
                {section.content.map((paragraph, pIndex) => (
                  <p
                    key={pIndex}
                    className="text-[var(--text-secondary)] leading-relaxed"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card p-6 mt-8"
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Contact Us
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li>• GitHub: <a href="https://github.com/BitBlocksProject/BitBlocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">BitBlocksProject/BitBlocks</a></li>
            <li>• X (Twitter): <a href="https://x.com/bitblocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">@bitblocks</a></li>
            <li>• Discord: <a href="https://discord.gg/bitblocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">BitBlocks Community</a></li>
          </ul>
        </motion.div>

        {/* Updates Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="card p-6 mt-6"
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Changes to This Policy
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify users of any
            material changes by posting the new Privacy Policy on this page and updating the
            "Last updated" date. We encourage you to review this Privacy Policy periodically
            to stay informed about how we are protecting your information.
          </p>
        </motion.div>
      </section>
    </div>
  );
}

