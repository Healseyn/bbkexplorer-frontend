# BitBlocks Explorer 🔗

<div align="center">

![BitBlocks Explorer](https://img.shields.io/badge/BitBlocks-Explorer-00d4ff?style=for-the-badge&logo=bitcoin&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**An open-source blockchain explorer with a modern, beautiful interface.**

[Demo](#demo) • [Features](#features) • [Installation](#installation) • [Configuration](#configuration) • [API](#api) • [Contributing](#contributing)

</div>

---

## ✨ Features

- 🔍 **Universal Search** - Search by block height, hash, transaction ID, or address
- 📊 **Network Statistics** - Real-time network stats including hash rate, difficulty, and mempool info
- 🧱 **Block Explorer** - Browse and inspect block details and transactions
- 💸 **Transaction Details** - View inputs, outputs, fees, and confirmation status
- 👛 **Address Tracking** - Check balances, transaction history, and activity
- 📱 **Responsive Design** - Beautiful UI that works on all devices
- 🌙 **Dark Theme** - Modern dark theme with cyan/purple accents
- ⚡ **Fast & Efficient** - Built with Next.js App Router and React Query

## 🖼️ Screenshots

The explorer features a modern dark theme with:
- Gradient accents (cyan to purple)
- Grid background pattern
- Smooth animations with Framer Motion
- JetBrains Mono for hashes and addresses
- Outfit font for UI text

## 🚀 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API server (see [API Configuration](#api-configuration))

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/bitblocks/explorer.git
cd explorer
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:3001/api" > .env.local
```

4. **Start development server**
```bash
npm run dev
```

5. **Open in browser**
```
http://localhost:3000
```

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API endpoint | `http://localhost:3001/api` |

### API Configuration

The explorer expects a backend API with the following endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/stats` | GET | Network statistics |
| `/api/blocks` | GET | List blocks (pagination) |
| `/api/block/:hashOrHeight` | GET | Block details |
| `/api/block/:hashOrHeight/transactions` | GET | Block transactions |
| `/api/transactions` | GET | Recent transactions |
| `/api/tx/:txid` | GET | Transaction details |
| `/api/address/:address` | GET | Address details |
| `/api/address/:address/transactions` | GET | Address transactions |
| `/api/search` | GET | Search by query |
| `/api/mempool` | GET | Mempool transactions |

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Home page
│   ├── blocks/            # Blocks list page
│   ├── block/[hashOrHeight]/ # Block details page
│   ├── transactions/      # Transactions list page
│   ├── tx/[txid]/        # Transaction details page
│   ├── address/[address]/ # Address details page
│   ├── mempool/          # Mempool page
│   └── search/           # Search results page
├── components/
│   ├── layout/           # Header, Footer
│   └── ui/               # Reusable UI components
├── lib/
│   └── api.ts            # API client and utilities
├── providers/
│   └── QueryProvider.tsx # React Query provider
└── types/
    └── index.ts          # TypeScript types
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching**: [TanStack Query](https://tanstack.com/query)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📝 Scripts

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by blockchain explorers like [Blockstream.info](https://blockstream.info) and [Mempool.space](https://mempool.space)
- Built with ❤️ by the BitBlocks community

---

<div align="center">

**[⬆ Back to top](#bitblocks-explorer-)**

Made with ☕ and 🎵

</div>
