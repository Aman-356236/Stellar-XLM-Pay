Stellar XLM Pay

A simple and secure Stellar payment dApp for connecting a Freighter wallet, viewing XLM balance, and sending XLM on the Stellar Testnet.

🚀 Overview

Stellar XLM Pay is a frontend-focused decentralized application (dApp) built on the Stellar network.

The application allows users to:

Connect their Freighter wallet
View their XLM Testnet balance
Refresh wallet balance
Send XLM to another Stellar Testnet address
Sign transactions securely through Freighter
View transaction success status and transaction hash
Disconnect their wallet
✨ Features
🔐 Freighter Wallet

Connect and disconnect a Stellar wallet using the Freighter browser extension.

💰 XLM Balance

Fetch and display the connected wallet's current XLM balance from the Stellar Testnet.

🚀 Send XLM

Enter a recipient Stellar address and XLM amount to create and submit a payment transaction.

✅ Transaction Confirmation

Transactions are signed through Freighter and submitted to the Stellar Testnet.

🔄 Balance Refresh

Refresh the displayed XLM balance after transactions or whenever needed.

📱 Responsive UI

Clean and responsive interface designed for desktop and mobile screens.

🛠️ Tech Stack
Technology	Usage
React	Frontend UI
TypeScript	Application logic
Vite	Development and build tooling
Stellar SDK	Stellar transaction and network interaction
Freighter API	Wallet connection and transaction signing
CSS	UI styling
Stellar Testnet	Blockchain network
🏗️ Project Structure
Stellar-XLM-Pay/
├── public/
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
├── .gitignore
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md

⚙️ Getting Started
Prerequisites

Before running the project, make sure you have:

Node.js installed
npm installed
A Chromium-based browser
Freighter wallet extension
A Stellar Testnet account
Installation

Clone the repository:

git clone https://github.com/Aman-356236/Stellar-XLM-Pay.git


Navigate into the project:

cd Stellar-XLM-Pay

Install dependencies:

npm install


Start the development server:

npm run dev


Open the local development URL shown in the terminal.

🦊 Freighter Setup
Install the Freighter browser extension.
Create or import a Stellar wallet.
Switch Freighter to Testnet.
Connect the wallet to the application.
Use a Stellar Testnet account for testing transactions.

Important: This project uses the Stellar Testnet. Do not use real funds for testing.

💸 Transaction Flow
Connect Freighter
       ↓
Fetch XLM Balance
       ↓
Enter Recipient Address
       ↓
Enter XLM Amount
       ↓
Build Stellar Transaction
       ↓
Sign with Freighter
       ↓
Submit to Stellar Testnet
       ↓
Display Transaction Hash
       ↓
Refresh XLM Balance

🌐 Network

This project currently uses:

Stellar Testnet

Horizon endpoint:

https://horizon-testnet.stellar.org


The application is intended for development and testing purposes.

🧪 Tested Functionality

The main transaction flow has been tested successfully on Stellar Testnet.

Tested:

Wallet connection
XLM balance retrieval
1 XLM Testnet payment
Freighter transaction confirmation
Transaction submission
Transaction hash generation
Post-transaction balance update
🔒 Security Notes
Never share your wallet secret key or recovery phrase.
Never commit private keys, seed phrases, or sensitive credentials to GitHub.
Test transactions only with Stellar Testnet accounts.
This project does not require users to provide their wallet secret key.
📌 Future Improvements

Potential future improvements include:

Transaction history
Better transaction status tracking
Address book for frequent recipients
Improved error handling
Loading animations
Network selection
Stellar transaction explorer integration
Additional wallet support
👨‍💻 Author

Aman Mondal

GitHub: @Aman-356236

📄 License

This project is intended for educational and development purposes.