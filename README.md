🚀 Stellar XLM Pay
A simple, fast and secure Stellar Testnet payment dApp.

Stellar XLM Pay is a decentralized payment application that allows users to connect their Freighter wallet, check their XLM balance, and send XLM transactions securely on the Stellar Testnet.

✨ Features
🔐 Freighter Wallet Connection
Connect and disconnect your Stellar wallet securely.
💰 XLM Balance
View your current Stellar Testnet XLM balance.
🔄 Refresh Balance
Refresh your wallet balance after transactions.
🚀 Send XLM
Send XLM to another Stellar Testnet address.
🦊 Freighter Transaction Signing
Transactions are securely signed through Freighter.
✅ Transaction Confirmation
Display transaction success status and transaction hash.
📱 Responsive UI
Clean interface designed for desktop and mobile screens.
🛠️ Tech Stack
Technology	Purpose
⚛️ React	Frontend UI
🔷 TypeScript	Application logic
⚡ Vite	Development & build tool
⭐ Stellar SDK	Stellar blockchain interaction
🦊 Freighter API	Wallet connection & signing
🎨 CSS	UI styling
🌐 Stellar Testnet	Blockchain network
🔄 How It Works
┌──────────────────────┐
│   Connect Freighter  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│   Fetch XLM Balance  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Enter Recipient      │
│ + XLM Amount         │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Build Transaction    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Sign with Freighter  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Submit to Testnet    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Transaction Hash     │
│ + Success Message    │
└──────────────────────┘

⚙️ Getting Started
1. Prerequisites

Make sure you have:

Node.js
npm
A Chromium-based browser
Freighter Wallet extension
A Stellar Testnet account
2. Clone the Repository
git clone https://github.com/Aman-356236/Stellar-XLM-Pay.git

3. Enter the Project
cd Stellar-XLM-Pay

4. Install Dependencies
npm install

5. Start Development Server
npm run dev


Open the local URL shown in your terminal.

🦊 Freighter Setup
Install the Freighter browser extension.
Create or import a Stellar wallet.
Switch the wallet network to Testnet.
Open the Stellar XLM Pay application.
Click Connect Freighter Wallet.
Approve the wallet connection.

⚠️ This application uses the Stellar Testnet. Do not use real funds.

💸 Sending XLM
Connect your Freighter wallet.
Enter the recipient's Stellar address.
Enter the amount of XLM.
Click Send XLM.
Confirm the transaction in Freighter.
Wait for the transaction to be submitted.
View the transaction hash on the application.
Refresh the balance if required.
📸 Screenshots
🔐 Wallet Connected

💰 Balance Displayed

✅ Successful Transaction

📋 Transaction Result

🌐 Stellar Testnet

This project currently runs on the Stellar Testnet.

Horizon Endpoint

https://horizon-testnet.stellar.org


All transactions made through this application are test transactions.

🧪 Tested Transaction

The application has been successfully tested with a real 1 XLM Testnet transaction.

Tested Flow
Wallet Connected

      ↓

Balance Fetched

      ↓

1 XLM Entered

      ↓

Freighter Confirmation

      ↓

Transaction Submitted

      ↓

Success Message

      ↓

Transaction Hash Generated

Result

Transaction Status: ✅ Successful

Network: Stellar Testnet

Amount: 1 XLM

Transaction Hash:

adc5b2369ef852a9e8301036c218538c650f5ccd0a7309f3f2f07a70d3d51b40

🔐 Security
🔒 Private keys are never requested by the application.
🔒 Never share your wallet secret key.
🔒 Never share your recovery phrase.
🔒 Never commit private keys or secrets to GitHub.
🧪 Use Stellar Testnet accounts for testing.
📁 Project Structure
Stellar-XLM-Pay/

│
├── public/
│
├── screenshots/
│   ├── wallet-connected.png
│   ├── balance-displayed.png
│   ├── successful-transaction.png
│   └── transaction-result.png
│
├── src/
│   ├── assets/
│   ├── App.tsx
│   ├── App.css
│   ├── index.css
│   └── main.tsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md

🚧 Future Improvements
📜 Transaction history
🔎 Stellar transaction explorer links
👥 Saved recipient addresses
⏳ Better transaction loading states
⚠️ Improved error handling
🌐 Network selection
🦊 Additional wallet support
🎨 Further UI improvements
👨‍💻 Author
Aman Mondal

GitHub:
https://github.com/Aman-356236

Project Repository:
https://github.com/Aman-356236/Stellar-XLM-Pay

📄 License

This project is created for educational and development purposes.

⭐ If you find this project useful, consider giving the repository a star!