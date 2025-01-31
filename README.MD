# Data Labeling Platform 🏷️

A decentralized platform built on Autonomous Chain for data labeling with performance-based NFT rewards and token rewards, leveraging Autonomous SDK and Auto Drive for AI-powered support and decentralized storage. All data including NFT metadata is stored on-chain and Auto Drive for maximum decentralization.

## Live Demo 🌐
Visit our platform: [https://data-dao.vercel.app/](https://data-dao.vercel.app/)

## Overview 🌟

The Data Labeling Platform is a Web3 application built on Autonomous Chain that enables users to participate in data labeling tasks while earning both evolving NFTs based on their performance and ERC20 token rewards. The platform revolutionizes data labeling through blockchain technology, Autonomous SDK integration, and gamification.

### Key Features ✨

- 🎮 Performance-based NFT rewards that evolve with user contributions
- 🏆 NFT ranking system with leaderboards and achievements
- 💰 ERC20 token rewards for completing tasks
- 🤖 AI-powered customer support powered by Autonomous SDK
- 📱 Real-time multi-channel notifications via Discord and Telegram
- 💾 Fully decentralized data & metadata storage using Auto Drive and on-chain storage
- 💰 Smart contract powered reward system on Autonomous Chain
- 🐦 AI-assisted social media integration via Autonomous SDK

## Architecture 🏗️

### Smart Contracts 📄

#### PerformanceNFT Contract
The core NFT contract on Autonomous Chain tracks user performance metrics:
- Tasks completed
- Quality scores
- Consecutive high scores
- Time-based evolution thresholds
- Dynamic metadata updates stored on-chain
- Auto Drive CID integration for NFT images
- NFT ranking system with global leaderboard
- Achievement badges and special rewards
- Performance history tracking
- Skill level progression system

#### NFT Stats & Ranking System
- Global leaderboard tracking top performers
- Weekly/monthly ranking resets
- Achievement badges for milestones
- Special rewards for top ranked users
- Performance metrics dashboard
- Historical performance tracking
- Skill level progression visualization
- Comparative stats with other users
- Real-time ranking updates
- Achievement unlock notifications

#### DataLabelingPlatform Contract
Manages on Autonomous Chain:
- Task creation and participation
- ERC20 token reward distribution
- Quality validation and scoring
- Token deposits and withdrawals
- Performance tracking
- User balance management
- Task deadline enforcement (minimum 3 hours)
- Claimable rewards tracking
- Quality score submission (0-100 range)

### Frontend 🖥️

Built with Next.js and integrates:
- Discord bot for notifications
- Telegram bot for alerts
- Auto Drive for decentralized storage
- Wagmi for Web3 interactions
- Autonomous SDK for AI features
- Social media automation
- Interactive NFT stats dashboard
- Real-time ranking leaderboard
- Achievement showcase
- Performance analytics

### AI Integration 🤖

#### Current Implementation
- Chat functionality powered by Gemini API
- Stateless conversations (chats are not saved)
- Basic AI assistance for platform usage

#### Future Plans
- Integration with Autonomous Agent for Discord bot
- Persistent chat history
- Enhanced AI capabilities through Autonomous SDK
- Multi-channel support (Discord, Telegram)
- AI-powered task recommendations
- Automated performance analytics

## Token Reward System 💰

### Task Rewards
- Task creators deposit ERC20 tokens as rewards
- Rewards are distributed equally among participants
- Participants can claim rewards after task completion
- Unclaimed rewards remain claimable indefinitely
- Task creators can withdraw unused deposits

### Token Features
- Secure ERC20 token integration
- Balance tracking per user
- Deposit/withdrawal functionality
- Automatic reward distribution
- Protection against reentrancy attacks

## Evolution System 🌱

NFTs evolve through four tiers based on performance, with all metadata stored on-chain:

| Level | Tasks Required | Title | Min Quality Score | Special Abilities |
|-------|---------------|-------|-------------------|-------------------|
| 1 | 5 | Rookie | 70 | Basic Stats Tracking |
| 2 | 20 | Intermediate | 70 | Achievement Badges |
| 3 | 50 | Expert | 70 | Ranking Multipliers |
| 4 | 100 | Master | 70 | Special Rewards Access |

### Evolution Features
- Dynamic metadata updates stored on-chain using auto drive
- Performance-based evolution
- Quality score tracking
- Consecutive achievement bonuses
- Time-based evolution thresholds
- Special ability unlocks
- Ranking system integration
- Achievement tracking
- Historical performance data
- Comparative analytics

## Components 🧩

### Core Components
- TaskList with filtering and sorting
- TaskCard with detailed metrics
- Performance Dashboard
- NFT Evolution Tracker
- Token Balance & Rewards Display
- Notification Center
- AI Support Chat powered by Autonomous SDK

### Integration Components
- Discord Bot Interface
- Telegram Alert System
- Auto Drive Storage Manager
- Social Media Connector

## Pending Implementation 🛠️

- Real-time notification system for immediate updates
- Ranking board to display top performers based on ranking
- Expansion of Auto Agent AI capabilities beyond Twitter
- Participation analysis for deeper insights into user engagement
- Enhanced NFT features for more dynamic and interactive user experiences
- Migration from excessive use of hooks to API routes (routing files already available in api/routes endpoints)

## Roadmap 🗺️

### Phase 1 (Current)
- ✅ Basic AI chat with Gemini
- ✅ Contract deployment on Taurus
- ✅ Basic platform functionality

### Phase 2 (Upcoming)
- 🔄 Autonomous Agent integration
- 🔄 Discord bot implementation
- 🔄 Persistent chat history
- 🔄 Enhanced AI capabilities

## Deployed Contracts on Taurus Mainnet 🌐

| Contract | Address | Explorer Link |
|----------|---------|---------------|
| DataLabelingPlatform | `0x470658a21d9f83248B18301972111DD1bBf774C9` | [View on Blockscout](https://blockscout.taurus.autonomys.xyz/address/0x470658a21d9f83248B18301972111DD1bBf774C9) |
| ERC20Mock Token | `0xF3A7b4Bc6F72f2490dA7b9BCd8CE6b34A1A6335c` | [View on Blockscout](https://blockscout.taurus.autonomys.xyz/address/0xF3A7b4Bc6F72f2490dA7b9BCd8CE6b34A1A6335c) |
| PerformanceNFT | `0xEd51ca2ebB382E6f28aCc011C13b516D458671C3` | [View on Blockscout](https://blockscout.taurus.autonomys.xyz/address/0xEd51ca2ebB382E6f28aCc011C13b516D458671C3) |

### AI Integration 🤖

#### Current Implementation
- Chat functionality powered by Gemini API
- Stateless conversations (chats are not saved)
- Basic AI assistance for platform usage

#### Future Plans
- Integration with Autonomous Agent for Discord bot
- Persistent chat history
- Enhanced AI capabilities through Autonomous SDK
- Multi-channel support (Discord, Telegram)
- AI-powered task recommendations
- Automated performance analytics

### Deployment Scripts 📜

The platform includes two main deployment scripts:

#### deploy.sh
- Handles initial contract deployment
- Deploys PerformanceNFT, ERC20Mock, and DataLabelingPlatform
- Verifies contracts on Blockscout
- Sets up initial contract configurations

#### interaction.sh
- Handles post-deployment interactions
- Sets up platform address in NFT contract
- Mints initial tokens to test users
- Creates sample tasks
- Sets up token approvals and deposits

## Getting Started 🚀

### Quick Start
- Visit [https://data-dao.vercel.app/](https://data-dao.vercel.app/) to use the platform
- Connect your MetaMask wallet
- Start participating in data labeling tasks

### Local Development

### Prerequisites
- Node.js v16+
- Foundry
- MetaMask wallet
- Discord Bot Token
- Telegram Bot Token
- Autonomous SDK API Key
- Auto Drive API Key
- ERC20 Token for rewards

### Environment Variables

```env
NEXT_PUBLIC_AUTODRIVE_API_KEY=your_key
DISCORD_BOT_TOKEN=your_token
TELEGRAM_BOT_TOKEN=your_token
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
OPENAI_API_KEY=your_openai_key #optional based on pefered model
NEXT_PUBLIC_APPLICATION_ID=your_app_id #discord
PUBLIC_KEY=your_public_key #dicord bot public key
NEXT_PUBLIC_DISCORD_REDIRECT_URI=your_discord_redirect
DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_API_URL=your_api_url
GEMINI_APIKEY=your_gemini_api_key  # Currently used for chat
NEXT_PUBLIC_APPLICATION_ID=your_app_id
PUBLIC_KEY=your_public_key
NEXT_PUBLIC_DISCORD_REDIRECT_URI=your_discord_redirect
DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_API_URL=your_api_url

```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/data-labeling-platform.git
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```env
NEXT_PUBLIC_AUTODRIVE_API_KEY=your_key
DISCORD_BOT_TOKEN=your_token
TELEGRAM_BOT_TOKEN=your_token
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address
OPENAI_API_KEY=your_openai_key #optional based on pefered model
NEXT_PUBLIC_APPLICATION_ID=your_app_id #discord
PUBLIC_KEY=your_public_key #dicord bot public key
NEXT_PUBLIC_DISCORD_REDIRECT_URI=your_discord_redirect
DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_API_URL=your_api_url
GEMINI_APIKEY=your_gemini_api_key  # Currently used for chat
NEXT_PUBLIC_APPLICATION_ID=your_app_id
PUBLIC_KEY=your_public_key
NEXT_PUBLIC_DISCORD_REDIRECT_URI=your_discord_redirect
DISCORD_BOT_TOKEN=your_discord_bot_token
NEXT_PUBLIC_API_URL=your_api_url

```

4. Deploy contracts:
```bash
forge create src/DataLabelingPlatform.sol:DataLabelingPlatform --rpc-url http://127.0.0.1:8545 --broadcast

forge script script/Interactions.s.sol:Interactions --rpc-url http://127.0.0.1:8545 --broadcast

forge create src/DataLabelingPlatform.sol:DataLabelingPlatform --rpc-url http://127.0.0.1:8545 --broadcast --constructor-args Ai13 tokenAddress PerformanceNftAddress

forge create lib/openzeppelin-contracts/contracts/mocks/token/ERC20Mock.sol:ERC20Mock --rpc-url http://127.0.0.1:8545 --broadcast
```

5. Start the development server:

```bash
npm run dev
```

## Testing 🧪

Run the test suite:

```bash
npm run test
forge test # For smart contracts
```

## Documentation 📚

- [Smart Contract Documentation](./docs/contracts.md)
- [Frontend Documentation](./docs/frontend.md)
- [AI Integration Guide](./docs/ai-integration.md)
- [API Reference](./docs/api-reference.md)

## Contributing 🤝

1. Fork the repository
2. Create feature branch
3. Submit pull request

## Security 🔒

- This CODEBASE is not audited and should not be used in production.

## License 📄

MIT

---

Built with ❤️ by Blockchain Oracle
