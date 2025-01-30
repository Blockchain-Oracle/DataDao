# write test
# do the front end 
# integrate with the autonomys sdk
# todo add nft reputation for users that participate in tasks
//this should be nft that elove
//bash script to deploy and interact with the contract
//for the ai since it allow twitter posting you can do it that user 
can click on add post to twitter and it will post to twitter using ai

// Using Autonomys AI for support
const supportAgent = new autonomys.Agent({
  personality: "Helpful support assistant",
  memory: true // Permanent memory storage
});

// Handle user queries
const handleSupport = async (query: string) => {
  const response = await supportAgent.respond(query);
  return response;
}

// Components needed:
- TaskList
  - TaskCard
    - Task details
    - Participation button
    - Reward info
    - Deadline countdown

// Contract interaction
const getTasks = async () => {
  const tasks = await contract.getActiveTasks();
  return tasks.map(formatTaskData);
}

// Using Autonomys AI for support
const supportAgent = new autonomys.Agent({
  personality: "Helpful support assistant",
  memory: true // Permanent memory storage
});

// Handle user queries
const handleSupport = async (query: string) => {
  const response = await supportAgent.respond(query);
  return response;
}

// Components needed:
- WalletConnect button
- Balance display
- Transaction notifications

// Using Autonomys SDK for chain interactions
const connectWallet = async () => {
  await autonomys.wallet.connect();
}


frontend/
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Layout.tsx
│   ├── task/
│   │   ├── TaskCreationForm.tsx
│   │   ├── TaskList.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskDetails.tsx
│   ├── wallet/
│   │   ├── WalletConnect.tsx
│   │   └── Balance.tsx
│   └── ai/
│       └── SupportChat.tsx
├── pages/
│   ├── index.tsx
│   ├── tasks/
│   │   ├── create.tsx
│   │   └── [id].tsx
│   └── dashboard.tsx
├── hooks/
│   ├── useContract.ts
│   ├── useAutonomys.ts
│   └── useWallet.ts
└── utils/
    ├── constants.ts
    └── helpers.ts