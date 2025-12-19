'use client';

import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Shield, Gavel, Ban, Info } from 'lucide-react';

export default function TermsOfServicePage() {
  const sections = [
    {
      icon: FileText,
      title: 'Acceptance of Terms',
      content: [
        'By accessing and using BitBlocks Explorer ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.',
        'These Terms of Service ("Terms") govern your access to and use of BitBlocks Explorer, an open-source blockchain explorer for the BitBlocks (BBK) blockchain.',
      ],
    },
    {
      icon: Info,
      title: 'Description of Service',
      content: [
        'BitBlocks Explorer is a web-based blockchain explorer that provides:',
        '• Public blockchain data visualization (blocks, transactions, addresses)',
        '• Real-time network statistics',
        '• Masternode information',
        '• Search functionality for blockchain data',
        '• API access to blockchain data',
        'The Service displays publicly available blockchain data and does not store or manage cryptocurrency wallets or private keys.',
      ],
    },
    {
      icon: Shield,
      title: 'Use of Service',
      content: [
        'You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:',
        '• Use the Service in any way that violates any applicable law or regulation',
        '• Attempt to gain unauthorized access to the Service or its related systems',
        '• Interfere with or disrupt the Service or servers connected to the Service',
        '• Use automated systems (bots, scrapers) that may overload or damage the Service',
        '• Use the Service to transmit any malicious code, viruses, or harmful content',
        '• Impersonate any person or entity or misrepresent your affiliation with any person or entity',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Disclaimer of Warranties',
      content: [
        'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.',
        'We do not warrant that:',
        '• The Service will be uninterrupted, secure, or error-free',
        '• The results obtained from using the Service will be accurate or reliable',
        '• Any errors in the Service will be corrected',
        '• The blockchain data displayed is always up-to-date or complete',
        'You use the Service at your own risk.',
      ],
    },
    {
      icon: Ban,
      title: 'Limitation of Liability',
      content: [
        'TO THE MAXIMUM EXTENT PERMITTED BY LAW, BITBLOCKS EXPLORER AND ITS CONTRIBUTORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM:',
        '• Your use or inability to use the Service',
        '• Any unauthorized access to or use of our servers and/or any personal information stored therein',
        '• Any interruption or cessation of transmission to or from the Service',
        '• Any bugs, viruses, trojan horses, or the like that may be transmitted to or through the Service',
        '• Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through the Service',
      ],
    },
    {
      icon: Gavel,
      title: 'Intellectual Property',
      content: [
        'BitBlocks Explorer is an open-source project. The source code is available under the applicable open-source license.',
        'All content displayed on the Service, including but not limited to text, graphics, logos, and software, is the property of BitBlocks Explorer or its content suppliers and is protected by copyright and other intellectual property laws.',
        'You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly perform, republish, download, store, or transmit any of the material on our Service without prior written consent, except as permitted by the open-source license.',
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Blockchain Data Accuracy',
      content: [
        'While we strive to provide accurate and up-to-date blockchain information, we cannot guarantee:',
        '• The accuracy, completeness, or timeliness of blockchain data',
        '• That all transactions or blocks are displayed',
        '• That the data is free from errors or omissions',
        'Blockchain data is inherently public and decentralized. We display data as it appears on the blockchain network, but we are not responsible for the accuracy of the underlying blockchain data itself.',
        'Always verify critical information through multiple sources and never rely solely on this Service for financial decisions.',
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
              <span className="glow-text">Terms of</span>{' '}
              <span className="text-[var(--text-primary)]">Service</span>
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
              Please read these Terms of Service ("Terms") carefully before using BitBlocks Explorer
              ("the Service", "we", "us", or "our"). These Terms constitute a legally binding
              agreement between you and BitBlocks Explorer.
            </p>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              <strong className="text-[var(--text-primary)]">Important:</strong> By using this Service,
              you acknowledge that blockchain data is public and that we are not responsible for the
              accuracy of blockchain data or any financial decisions made based on information displayed
              on this Service.
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

        {/* Additional Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="card p-6 mt-8"
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Additional Terms
          </h2>
          <div className="space-y-4 text-[var(--text-secondary)]">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Termination</h3>
              <p className="leading-relaxed">
                We reserve the right to terminate or suspend your access to the Service immediately,
                without prior notice or liability, for any reason, including if you breach these Terms.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Governing Law</h3>
              <p className="leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to its conflict of law provisions.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">Changes to Terms</h3>
              <p className="leading-relaxed">
                We reserve the right to modify or replace these Terms at any time. If a revision is
                material, we will provide at least 30 days notice prior to any new terms taking effect.
                What constitutes a material change will be determined at our sole discretion.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.0 }}
          className="card p-6 mt-6"
        >
          <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
            Contact Information
          </h2>
          <p className="text-[var(--text-secondary)] leading-relaxed mb-4">
            If you have any questions about these Terms of Service, please contact us:
          </p>
          <ul className="space-y-2 text-[var(--text-secondary)]">
            <li>• GitHub: <a href="https://github.com/BitBlocksProject/BitBlocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">BitBlocksProject/BitBlocks</a></li>
            <li>• X (Twitter): <a href="https://x.com/bitblocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">@bitblocks</a></li>
            <li>• Discord: <a href="https://discord.gg/bitblocks" target="_blank" rel="noopener noreferrer" className="text-[var(--accent-primary)] hover:underline">BitBlocks Community</a></li>
          </ul>
        </motion.div>
      </section>
    </div>
  );
}

