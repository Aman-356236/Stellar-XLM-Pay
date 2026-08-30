# 🚀 Stellar XLM Pay

### A production-oriented Stellar Testnet payment dApp with advanced Soroban smart contract integration.

Stellar XLM Pay is a decentralized payment application built on the **Stellar Testnet**.

The application allows users to connect supported Stellar wallets, check their XLM balance, send XLM transactions, interact with Soroban smart contracts, record activity through inter-contract communication, and display transaction and contract-event information.

This project evolved through **Stellar Level 1, Level 2 (Yellow Belt), and Level 3 (Orange Belt)** development.

---

# 🟠 Level 3 – Orange Belt

Level 3 extends the application from a basic Stellar payment dApp into a more production-oriented decentralized application.

### Level 3 Highlights

- Advanced Soroban smart contract logic

- Inter-contract communication

- Activity Registry contract

- Contract administration

- Registry configuration

- Contract state management

- Contract event emission

- Real-time contract activity

- GitHub Actions CI/CD

- Smart contract deployment workflow

- Stellar Testnet deployment

- Mobile responsive frontend

- Loading and error states

- Contract testing

- Frontend testing

- Production deployment with Vercel

- Documentation

- Demo presentation

---

# 🌐 Live Demo

## Production Frontend

https://stellar-xlm-pay.vercel.app/

The application is deployed on **Vercel** and connected to the **Stellar Testnet**.

---

# 🎥 Demo Video

## Stellar XLM Pay – Demo Video

https://youtu.be/vL3AOQow99U

The demo video presents the major functionality of the application, including:

- Stellar wallet connection

- XLM balance

- XLM payment flow

- Soroban smart contract interaction

- Contract activity

- Transaction status

- Production deployment

- CI/CD workflow

---

# ✨ Features

## 🔐 Stellar Wallet Connection

- Connect supported Stellar wallets through **Stellar Wallets Kit**

- Display available wallet options

- Approve wallet connections securely

- Disconnect the connected wallet

- Multi-wallet connection experience

## 💰 XLM Balance

- View the current Stellar Testnet XLM balance

- Fetch balance directly from Stellar Testnet

- Refresh balance after transactions

## 🚀 Send XLM

- Send XLM to another Stellar Testnet address

- Validate recipient addresses

- Validate XLM amounts

- Prevent invalid transaction amounts

- Prevent sending more XLM than the available balance

- Display transaction status

- Display transaction hash

## 🦊 Secure Wallet Signing

Transactions are securely signed through the connected Stellar wallet.

The application:

- Never requests private keys

- Never stores private keys

- Requires explicit wallet approval before transactions

## 📜 Soroban Smart Contracts

The application integrates with Soroban smart contracts deployed on the Stellar Testnet.

Supported functionality includes:

- Contract invocation

- Contract simulation

- Transaction preparation

- Wallet signing

- Contract transaction submission

- Contract return-value reading

- Contract state updates

- Contract event handling

## 🔗 Inter-Contract Communication

Level 3 introduces an **Activity Registry** contract.

The main Soroban contract communicates with the Activity Registry during the `hello_and_record` workflow.

The registry records activity information such as:

- Recipient

- Activity count

- Record ID

- Calling contract

- Registry information

This demonstrates **contract-to-contract communication on Soroban**.

## 📡 Contract Events

The Level 3 workflow emits structured contract events.

The events provide information such as:

- Recipient

- Counter value

- Record ID

- Registry address

- Activity information

The frontend can display contract activity and transaction information after successful execution.

## 📊 Contract State

The smart contract maintains activity-related state including:

- Greeting counter

- Activity records

- Recipient information

- Registry configuration

## ⚠ Error Handling

The frontend handles:

- Wallet unavailable

- Wallet connection rejection

- Transaction rejection

- Invalid recipient

- Invalid XLM amount

- Insufficient XLM balance

- Smart contract simulation errors

- Smart contract transaction errors

- Failed transaction submission

- Loading states

## 📱 Responsive UI

The frontend is designed to work across:

- Desktop

- Laptop

- Mobile-width screens

A mobile responsive screenshot is included in the repository.

## 🟢 CI/CD

The project includes a GitHub Actions CI/CD workflow.

The workflow automatically verifies the project and reports the result through GitHub Actions.

A successful CI/CD run is included as repository evidence.

---

# 🛠 Tech Stack

| Technology | Purpose |

|---|---|

| ⚛ React | Frontend UI |

| 🔷 TypeScript | Application logic |

| ⚡ Vite | Development and production build |

| ⭐ Stellar SDK | Stellar blockchain interaction |

| 👛 Stellar Wallets Kit | Multi-wallet connection and signing |

| 📜 Soroban | Smart contract platform |

| 🦀 Rust | Soroban smart contract development |

| 🌐 Stellar RPC | Contract simulation and submission |

| 🔭 Stellar Horizon | Stellar account and payment operations |

| 🧪 Stellar Testnet | Blockchain network |

| 🟢 GitHub Actions | CI/CD automation |

| ▲ Vercel | Production deployment |

| 🎨 CSS | UI styling |

---

# 🔄 Application Architecture

```text

                         ┌──────────────────────┐

                         │       User / UI      │

                         └──────────┬───────────┘

                                    │

                                    ▼

                         ┌──────────────────────┐

                         │     React + TS       │

                         └──────────┬───────────┘

                                    │

                 ┌──────────────────┼──────────────────┐

                 │                  │                  │

                 ▼                  ▼                  ▼

          ┌─────────────┐    ┌─────────────┐    ┌─────────────┐

          │ Stellar     │    │ Stellar     │    │ Soroban     │

          │ Wallets Kit │    │ Horizon     │    │ RPC         │

          └──────┬──────┘    └──────┬──────┘    └──────┬──────┘

                 │                  │                  │

                 │                  │                  ▼

                 │                  │         ┌─────────────────┐

                 │                  │         │ Main Soroban    │

                 │                  │         │ Contract        │

                 │                  │         └────────┬────────┘

                 │                  │                  │

                 │                  │                  │

                 │                  │                  ▼

                 │                  │         ┌─────────────────┐

                 │                  │         │ Activity        │

                 │                  │         │ Registry        │

                 │                  │         └─────────────────┘

                 │                  │

                 └──────────────────┴──── Stellar Testnet

---

# 💸 XLM Payment Flow

```text

┌──────────────────────────┐

│   Connect Stellar Wallet │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│    Fetch XLM Balance     │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│ Enter Recipient + Amount │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│    Validate Transaction  │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│    Build Transaction     │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│     Wallet Signing       │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│    Submit to Testnet     │

└─────────────┬────────────┘

              │

              ▼

┌──────────────────────────┐

│ Transaction Hash +       │

│ Success / Error Status   │

└──────────────────────────┘

---

# 📜 Level 2 Soroban Flow

The Level 2 `hello` functionality is preserved.

```text

Connect Wallet

      ↓

Call Hello Contract

      ↓

Simulate Transaction

      ↓

Prepare Transaction

      ↓

Wallet Approval

      ↓

Submit Transaction

      ↓

Read Contract Return Value

      ↓

["Hello","Aman"]

      ↓

Process Contract Event

      ↓

Display Result

User calls hello_and_record

            │

            ▼

      Validate registry

            │

            ▼

      Call Activity Registry

            │

            ▼

    Registry records activity

            │

            ▼

      Return record ID

            │

            ▼

   Update greeting counter

            │

            ▼

       Emit HelloEvent

            │

            ▼

  Emit GreetingRecordedEvent

            │

            ▼

   Emit ActivityRecordedEvent

            │

            ▼

       Return ["Hello", name]

       ---

# 🔗 Inter-Contract Communication

Level 3 introduces an **Activity Registry** contract.

The main Soroban contract communicates with the Activity Registry during the `hello_and_record` workflow.

The registry records activity information such as:

- Recipient

- Activity count

- Record ID

- Calling contract

- Registry information

This demonstrates **contract-to-contract communication on Soroban**.

---

# 👑 Contract Administration

The Level 3 contract uses an administrator address for contract configuration.

### Administrator Address

```text

GC2LO4LMRRVOHCNRAWBRONACP3UAB3UXWULRGVLUTLNGMJIYWIE6QXJZ

The contract was successfully initialized with this administrator.

The Activity Registry was then configured through the contract administration flow.

---

# 📡 Level 3 Contract Events

The `hello_and_record` workflow emits structured contract events after successful execution.

### Activity Recorded Event

```text

record_id: 1

recipient: "Aman"

count: 1

recipient: "Aman"

count: 1

record_id: 1

registry: "Activity Registry"

The event confirms that the activity was successfully recorded by the Activity Registry.

---

# 📊 Level 3 Contract State

The smart contract keeps track of activity using persistent contract storage.

The contract maintains:

- Greeting counter

- Activity record information

- Recipient information

- Activity Registry address

- Administrator address

Each successful `hello_and_record` call updates the contract state.

Example:

```text

Greeting Counter: 1

Recipient: Aman

Record ID: 1

---

# ⚙️ Registry Configuration

The Activity Registry address is stored in the main contract configuration.

This allows the main contract to communicate with the Activity Registry during the `hello_and_record` workflow.

### Registry Address

```text

ACTIVITY_REGISTRY_CONTRACT_ID

```

The registry configuration can be updated through the administrator-controlled configuration flow.

---

# 🔐 Contract Access Control

The Level 3 contract uses an administrator address to control important configuration changes.

Administrator-only operations include:

- Setting the Activity Registry address

- Updating contract configuration

- Managing contract administration settings

Normal users can still call the public `hello` and `hello_and_record` functionality without administrator permissions.

---

# 🧪 Level 3 Contract Testing

The Level 3 smart contract was tested on the Stellar Testnet.

The testing covers:

- Contract initialization

- Administrator configuration

- Activity Registry configuration

- `hello` function

- `hello_and_record` function

- Inter-contract communication

- Activity record creation

- Greeting counter updates

- Contract event emission

- Contract state updates

- Invalid configuration handling

Example successful workflow:

```text

Contract Initialized

        ↓

Administrator Configured

        ↓

Activity Registry Configured

        ↓

hello_and_record Called

        ↓

Activity Recorded

        ↓

Counter Updated

        ↓

Events Emitted

        ↓

Contract State Updated

```

---

# 🖥️ Frontend Integration

The React frontend communicates with the deployed Soroban contract through Stellar RPC.

The frontend workflow is:

```text

Connect Wallet

      ↓

User enters name

      ↓

Call hello_and_record

      ↓

Build Soroban Transaction

      ↓

Simulate Transaction

      ↓

Prepare Transaction

      ↓

Wallet Approval

      ↓

Submit Transaction

      ↓

Wait for Confirmation

      ↓

Read Contract Result

      ↓

Display Activity Information

```

The frontend displays:

- Contract result

- Greeting counter

- Record ID

- Recipient

- Transaction status

- Contract activity

- Error messages

---

# 🔄 Real-Time Contract Activity

After a successful `hello_and_record` transaction, the frontend processes the transaction result and contract activity.

Example:

```text

Hello, Aman

Greeting Counter: 1

Record ID: 1

Activity: Recorded Successfully

```

This provides users with clear feedback after interacting with the Soroban contract.

---

# 🚨 Error Handling

The application handles common Level 3 errors safely.

Examples include:

- Wallet not connected

- Wallet approval rejected

- Invalid contract configuration

- Invalid registry address

- Contract simulation failure

- Transaction submission failure

- Contract execution failure

- Network errors

- Failed transaction confirmation

The frontend displays a readable error message instead of silently failing.

---

# 🟢 GitHub Actions CI/CD

The project includes a GitHub Actions workflow for automated verification.

The workflow checks the project before deployment.

Example workflow:

```text

Push Code to GitHub

        ↓

GitHub Actions Starts

        ↓

Install Dependencies

        ↓

Build Frontend

        ↓

Run Tests

        ↓

Verify Project

        ↓

Workflow Completed Successfully

```

A successful GitHub Actions run is included as project evidence.

---

# 🚀 Production Deployment

The frontend is deployed using Vercel.

Production architecture:

```text

GitHub Repository

        ↓

GitHub Actions

        ↓

Frontend Build

        ↓

Vercel Deployment

        ↓

Production Website

        ↓

Stellar Testnet

        ↓

Soroban Smart Contracts

```

### Production URL

https://stellar-xlm-pay.vercel.app/

---

# 📱 Responsive Frontend

The frontend was designed to work on different screen sizes.

Supported layouts include:

- Desktop

- Laptop

- Tablet-width screens

- Mobile-width screens

The interface provides loading indicators, transaction feedback, contract results, and error messages.

---

# 📚 Project Documentation

The repository contains documentation for:

- Project architecture

- Stellar payment flow

- Soroban contract flow

- Inter-contract communication

- Contract administration

- Contract events

- Contract state

- Testing

- CI/CD

- Production deployment

The documentation also includes screenshots and project evidence.

---

# 🏁 Level 3 Completion

Stellar XLM Pay successfully extends the original payment dApp with advanced Soroban functionality.

The final Level 3 implementation demonstrates:

- Stellar wallet integration

- XLM payments

- Soroban smart contracts

- Inter-contract communication

- Activity Registry

- Contract administration

- Persistent contract state

- Contract events

- Error handling

- Frontend integration

- Automated CI/CD

- Stellar Testnet deployment

- Production frontend deployment

The project demonstrates a complete flow from the user interface to Stellar Testnet and Soroban smart contracts.

---

# 🙌 Acknowledgements

This project was built as part of the Stellar development journey across Level 1, Level 2 (Yellow Belt), and Level 3 (Orange Belt).

Special thanks to the Stellar ecosystem and developer community for providing the tools, documentation, and testnet infrastructure used in this project.

---

## Author

### Aman Mondal

**GitHub:**  

https://github.com/Aman-356236

**Project Repository:**  

https://github.com/Aman-356236/Stellar-XLM-Pay

---

# 📄 License

This project is intended for educational and demonstration purposes on the Stellar Testnet.

---

# ⭐ Stellar XLM Pay

Built with React, TypeScript, Rust, Soroban, and Stellar Testnet.