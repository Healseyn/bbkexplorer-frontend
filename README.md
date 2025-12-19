# BitBlocks Explorer (BBK)

<div align="center">

![BitBlocks Explorer](https://img.shields.io/badge/BitBlocks-Explorer-blue)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/License-Open--Source-green)

**Open-source blockchain explorer for the BitBlocks (BBK) network**

[Features](#-features) • [Installation](#-installation) • [Development](#-development) • [Contributing](#-contributing)

</div>

## 📖 About

**BitBlocks Explorer** is a modern, open-source blockchain explorer developed for the BitBlocks (BBK) network. It provides an intuitive and transparent interface to explore blocks, transactions, addresses, masternodes, and other blockchain information.

> **⚠️ Important**: This repository contains **only the frontend** of the BitBlocks Explorer. To run a fully functional explorer, you need to set up and run a **separate backend API** that provides the blockchain data. This frontend application consumes data from that backend API through the `NEXT_PUBLIC_API_URL` environment variable.

### ✨ Features

- 🔍 **Complete Exploration**: View blocks, transactions, addresses, and masternodes
- ⚡ **Real-Time**: Real-time updates with API status indicators
- 🎨 **Modern Interface**: Responsive and modern design with smooth animations
- 🔎 **Smart Search**: Search by block hash, transaction hash, address, or block height
- 📊 **Network Statistics**: View real-time BitBlocks network statistics
- 🌐 **API Health**: Backend API status monitoring
- 📱 **Responsive**: Works perfectly on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with SSR/SSG
- **[React 19](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing
- **[Tailwind CSS 4](https://tailwindcss.com/)** - Utility-first styling
- **[Framer Motion](https://www.framer.com/motion/)** - Animations
- **[TanStack Query](https://tanstack.com/query)** - State management and data caching
- **[Axios](https://axios-http.com/)** - HTTP client
- **[Lucide React](https://lucide.dev/)** - Icons

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **Backend API**: A running BitBlocks Explorer backend API (this repository is frontend-only)

## 🚀 Installation

1. **Clone the repository**

```bash
git clone https://github.com/BitBlocksProject/bbkexplorer.git
cd bbkexplorer
```

2. **Install dependencies**

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Configure environment variables**

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Or if your API is on another server:

```env
NEXT_PUBLIC_API_URL=https://api.bitblockscrypto.com
```

> **⚠️ Important**: You must have a backend API running and accessible at the URL specified in `NEXT_PUBLIC_API_URL`. This frontend will not work without a backend API providing the blockchain data. The API URL can be the root or include `/api` at the end. The system automatically normalizes it.

4. **Run the development server**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🏗️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Create a production build
- `npm run start` - Start the production server (after build)
- `npm run lint` - Run ESLint linter

## 📁 Project Structure

```
bbkexplorer/
├── src/
│   ├── app/              # Routes and pages (App Router)
│   │   ├── address/      # Address page
│   │   ├── block/        # Block page
│   │   ├── blocks/       # Blocks list
│   │   ├── masternodes/  # Masternodes list
│   │   ├── transactions/ # Transactions list
│   │   └── ...
│   ├── components/       # React components
│   │   ├── layout/       # Header, Footer
│   │   └── ui/           # UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   │   ├── api.ts        # API client
│   │   └── block-cache.ts # Caching system
│   ├── providers/        # Context providers
│   └── types/            # TypeScript definitions
├── public/               # Static files
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000` |

### Caching System

The explorer uses a local caching system (localStorage) to improve performance:

- **Cache duration**: 7 days
- **Block limit**: 1000 blocks
- **Automatic caching**: Only confirmed blocks are cached
- **Automatic cleanup**: Old cache is automatically removed

## 🌐 Available Pages

- `/` - Home page with statistics and recent blocks
- `/blocks` - List of all blocks
- `/block/[hash]` - Details of a specific block
- `/transactions` - List of transactions
- `/tx/[hash]` - Details of a transaction
- `/address/[address]` - Details of an address
- `/masternodes` - List of masternodes
- `/peers` - List of network peers
- `/mempool` - Pending transactions
- `/privacy` - Privacy policy
- `/terms` - Terms of service

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the project
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Contribution Guidelines

- Follow existing code standards
- Add tests when appropriate
- Document significant changes
- Keep commits descriptive and organized

## 📝 License

This project is open-source. See the `LICENSE` file for more details.

## 🔗 Links

- **GitHub**: [BitBlocksProject/BitBlocks](https://github.com/BitBlocksProject/BitBlocks)
- **X (Twitter)**: [@bitblocks](https://x.com/bitblocks)
- **Discord**: [Discord BitBlocks](https://discord.gg/bitblocks)
