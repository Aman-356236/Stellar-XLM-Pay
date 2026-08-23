import { useState } from 'react'
import {
  StellarWalletsKit,
} from '@creit.tech/stellar-wallets-kit/sdk'
import {
  defaultModules,
} from '@creit.tech/stellar-wallets-kit/modules/utils'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from '@stellar/stellar-sdk'
import './App.css'

StellarWalletsKit.init({
  modules: defaultModules(),
})

StellarWalletsKit.setNetwork(Networks.TESTNET)

function App() {
  const [walletAddress, setWalletAddress] = useState('')
  const [balance, setBalance] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [transactionHash, setTransactionHash] = useState('')
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [walletCopied, setWalletCopied] = useState(false)
  const [transactionStatus, setTransactionStatus] = useState('')

  const server = new Horizon.Server(
    'https://horizon-testnet.stellar.org',
  )

  const fetchBalance = async (address: string) => {
    try {
      setError('')

      const account = await server.loadAccount(address)

      const xlmBalance = account.balances.find(
        (item) => item.asset_type === 'native',
      )

      setBalance(xlmBalance ? xlmBalance.balance : '0')
    } catch (err) {
      console.error(err)
      setError(
        'Unable to fetch wallet balance. Please check the wallet or network.',
      )
    }
  }

  const connectWallet = async () => {
    try {
      setError('')
      setSuccess('')
      setTransactionHash('')
      setCopied(false)
      setWalletCopied(false)
      setTransactionStatus('')

      const response = await StellarWalletsKit.authModal()

      if (!response?.address) {
        setError(
          'Wallet connection was rejected or no wallet was selected.',
        )
        return
      }

      setWalletAddress(response.address)
      setTransactionStatus('Wallet connected. Fetching balance...')

      await fetchBalance(response.address)

      setTransactionStatus('')
      setSuccess('Wallet connected successfully! 🎉')
    } catch (err) {
      console.error(err)

      const message =
        err instanceof Error ? err.message.toLowerCase() : ''

      if (
        message.includes('reject') ||
        message.includes('denied') ||
        message.includes('cancel')
      ) {
        setError(
          'Wallet connection was rejected. Please approve the connection.',
        )
      } else if (
        message.includes('not found') ||
        message.includes('unavailable')
      ) {
        setError(
          'No compatible Stellar wallet was found. Please install or open a supported wallet.',
        )
      } else {
        setError(
          'Failed to connect wallet. Please try again.',
        )
      }

      setTransactionStatus('')
    }
  }

  const sendXLM = async () => {
    try {
      setError('')
      setSuccess('')
      setTransactionHash('')
      setCopied(false)
      setTransactionStatus('')

      if (!walletAddress) {
        setError('Please connect your wallet first.')
        return
      }

      const cleanedRecipient = recipient.trim()

      if (!cleanedRecipient) {
        setError('Please enter a recipient address.')
        return
      }

      if (
        !cleanedRecipient.startsWith('G') ||
        cleanedRecipient.length !== 56
      ) {
        setError(
          'Please enter a valid Stellar recipient address.',
        )
        return
      }

      if (cleanedRecipient === walletAddress) {
        setError(
          'You cannot send XLM to your own wallet.',
        )
        return
      }

      const cleanedAmount = amount.trim()

      if (!cleanedAmount) {
        setError('Please enter an XLM amount.')
        return
      }

      const numericAmount = Number(cleanedAmount)

      if (
        !Number.isFinite(numericAmount) ||
        numericAmount <= 0
      ) {
        setError(
          'Please enter a valid XLM amount greater than 0.',
        )
        return
      }

      const decimalPart = cleanedAmount.split('.')[1]

      if (decimalPart && decimalPart.length > 7) {
        setError(
          'XLM amount cannot have more than 7 decimal places.',
        )
        return
      }

      const currentBalance = Number(balance)

      if (!Number.isFinite(currentBalance)) {
        setError(
          'Unable to read your current XLM balance.',
        )
        return
      }

      if (numericAmount >= currentBalance) {
        setError(
          'Insufficient XLM balance. Keep some XLM available for the transaction fee.',
        )
        return
      }

      setLoading(true)
      setTransactionStatus('Preparing transaction...')

      const account = await server.loadAccount(
        walletAddress,
      )

      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: cleanedRecipient,
            asset: Asset.native(),
            amount: cleanedAmount,
          }),
        )
        .setTimeout(180)
        .build()

      const transactionXDR = transaction.toXDR()

      setTransactionStatus(
        'Waiting for wallet approval...',
      )

      const signedTransaction =
        await StellarWalletsKit.signTransaction(
          transactionXDR,
          {
            networkPassphrase: Networks.TESTNET,
            address: walletAddress,
          },
        )

      if (!signedTransaction?.signedTxXdr) {
        setError(
          'Transaction signing was rejected or failed.',
        )
        setTransactionStatus('')
        return
      }

      setTransactionStatus(
        'Submitting transaction...',
      )

      const signedTx = TransactionBuilder.fromXDR(
        signedTransaction.signedTxXdr,
        Networks.TESTNET,
      )

      const result = await server.submitTransaction(
        signedTx,
      )

      setSuccess('XLM sent successfully! 🎉')
      setTransactionHash(result.hash)
      setTransactionStatus(
        'Transaction confirmed successfully!',
      )

      setRecipient('')
      setAmount('')

      await fetchBalance(walletAddress)
    } catch (err) {
      console.error(err)

      const message =
        err instanceof Error ? err.message.toLowerCase() : ''

      if (
        message.includes('reject') ||
        message.includes('denied') ||
        message.includes('cancel')
      ) {
        setError(
          'Transaction was rejected by the wallet.',
        )
      } else if (
        message.includes('insufficient') ||
        message.includes('balance')
      ) {
        setError(
          'Insufficient XLM balance for this transaction.',
        )
      } else if (
        message.includes('not found') ||
        message.includes('wallet')
      ) {
        setError(
          'Wallet not found or unavailable. Please reconnect your wallet.',
        )
      } else {
        setError(
          'Transaction failed. Please check the recipient address and balance.',
        )
      }

      setTransactionStatus('')
    } finally {
      setLoading(false)
    }
  }

  const copyTransactionHash = async () => {
    if (!transactionHash) return

    try {
      await navigator.clipboard.writeText(
        transactionHash,
      )

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error(err)
      setError('Failed to copy transaction hash.')
    }
  }

  const copyWalletAddress = async () => {
    if (!walletAddress) return

    try {
      await navigator.clipboard.writeText(
        walletAddress,
      )

      setWalletCopied(true)

      setTimeout(() => {
        setWalletCopied(false)
      }, 2000)
    } catch (err) {
      console.error(err)
      setError('Failed to copy wallet address.')
    }
  }

  const refreshWalletBalance = async () => {
    if (!walletAddress) return

    try {
      setRefreshing(true)
      await fetchBalance(walletAddress)
    } finally {
      setRefreshing(false)
    }
  }

  const disconnectWallet = async () => {
    try {
      await StellarWalletsKit.disconnect()
    } catch (err) {
      console.error(err)
    }

    setWalletAddress('')
    setBalance('')
    setError('')
    setSuccess('')
    setTransactionHash('')
    setRecipient('')
    setAmount('')
    setCopied(false)
    setWalletCopied(false)
    setTransactionStatus('')
  }

  const shortWalletAddress = walletAddress
    ? `${walletAddress.slice(
        0,
        6,
      )}...${walletAddress.slice(-6)}`
    : ''

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">
          Stellar XLM Pay
        </div>

        {walletAddress ? (
          <button
            className="connect-btn"
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </button>
        ) : (
          <button
            className="connect-btn"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
      </header>

      <main className="hero-section">
        <h1>
          Send XLM. Fast. Simple. Secure.
        </h1>

        <p className="subtitle">
          A simple Stellar payment app to connect
          your wallet, check your XLM balance, and
          send XLM on the Stellar Testnet.
        </p>

        <button
          className="primary-btn"
          onClick={connectWallet}
        >
          {walletAddress
            ? 'Wallet Connected'
            : 'Connect Stellar Wallet'}
        </button>

        {walletAddress && (
          <div className="wallet-address">
            <div className="wallet-label">
              <span>Connected Wallet</span>
            </div>

            <div className="wallet-display">
              <span className="wallet-short-address">
                {shortWalletAddress}
              </span>

              <button
                type="button"
                className="wallet-copy-btn"
                onClick={copyWalletAddress}
              >
                {walletCopied
                  ? '✓ Copied!'
                  : '📋 Copy'}
              </button>
            </div>

            <p className="balance-network">
              Connected using Stellar Wallets Kit
            </p>
          </div>
        )}

        {balance && (
          <div className="balance-card">
            <div className="balance-header">
              <span>💰</span>
              <span>XLM Balance</span>
            </div>

            <div className="balance-amount">
              {Number(balance).toFixed(2)}
              <span> XLM</span>
            </div>

            <p className="balance-network">
              Stellar Testnet
            </p>

            <button
              className="refresh-btn"
              onClick={refreshWalletBalance}
              disabled={refreshing}
            >
              {refreshing
                ? 'Refreshing...'
                : 'Refresh Balance'}
            </button>
          </div>
        )}

        {transactionStatus && !success && (
          <div className="transaction-status">
            <span className="status-spinner">
              ⏳
            </span>
            <span>{transactionStatus}</span>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>

            {transactionStatus && (
              <p className="transaction-confirmed">
                ✓ {transactionStatus}
              </p>
            )}

            {transactionHash && (
              <div className="transaction-result">
                <p className="transaction-title">
                  Transaction Hash:
                </p>

                <p className="transaction-hash">
                  {transactionHash}
                </p>

                <button
                  type="button"
                  className="copy-btn"
                  onClick={copyTransactionHash}
                >
                  {copied
                    ? '✓ Copied!'
                    : '📋 Copy Hash'}
                </button>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="error-message">
            {error}
          </p>
        )}
      </main>

      {walletAddress && (
        <section className="send-section">
          <h2>Send XLM</h2>

          <input
            type="text"
            placeholder="Recipient Stellar Address"
            className="send-input"
            value={recipient}
            onChange={(e) =>
              setRecipient(e.target.value)
            }
            disabled={loading}
          />

          <input
            type="number"
            placeholder="Amount in XLM"
            className="send-input"
            min="0"
            step="0.0000001"
            value={amount}
            onChange={(e) =>
              setAmount(e.target.value)
            }
            disabled={loading}
          />

          <button
            className="send-btn"
            onClick={sendXLM}
            disabled={loading}
          >
            {loading
              ? 'Processing Transaction...'
              : 'Send XLM'}
          </button>
        </section>
      )}

      <section className="features">
        <div className="feature-card">
          <h2>👛 Multi-Wallet</h2>
          <p>
            Connect supported Stellar wallets
            through Stellar Wallets Kit.
          </p>
        </div>

        <div className="feature-card">
          <h2>💰 XLM Balance</h2>
          <p>
            View your current Stellar Testnet
            balance.
          </p>
        </div>

        <div className="feature-card">
          <h2>🚀 Send XLM</h2>
          <p>
            Send XLM transactions on the Stellar
            Testnet.
          </p>
        </div>
      </section>
    </div>
  )
}

export default App