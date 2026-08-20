import { useState } from 'react'
import { requestAccess, signTransaction } from '@stellar/freighter-api'
import {
  Horizon,
  TransactionBuilder,
  Networks,
  Operation,
  Asset,
} from '@stellar/stellar-sdk'
import './App.css'

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

  const server = new Horizon.Server(
    'https://horizon-testnet.stellar.org'
  )

  const fetchBalance = async (address: string) => {
    try {
      setError('')

      const account = await server.loadAccount(address)

      const xlmBalance = account.balances.find(
        (item) => item.asset_type === 'native'
      )

      setBalance(xlmBalance ? xlmBalance.balance : '0')
    } catch (err) {
      console.error(err)
      setError('Failed to fetch XLM balance.')
    }
  }

  const connectWallet = async () => {
    try {
      setError('')
      setSuccess('')
      setTransactionHash('')

      const response = await requestAccess()

      if (response.error) {
        setError(response.error.message)
        return
      }

      setWalletAddress(response.address)

      await fetchBalance(response.address)
    } catch (err) {
      console.error(err)
      setError('Failed to connect wallet or fetch XLM balance.')
    }
  }

  const sendXLM = async () => {
    try {
      setError('')
      setSuccess('')
      setTransactionHash('')

      if (!walletAddress) {
        setError('Please connect your wallet first.')
        return
      }

      if (!recipient) {
        setError('Please enter a recipient address.')
        return
      }

      if (!recipient.startsWith('G') || recipient.length !== 56) {
        setError('Please enter a valid Stellar recipient address.')
        return
      }

      if (!amount || Number(amount) <= 0) {
        setError('Please enter a valid XLM amount.')
        return
      }

      setLoading(true)

      // Load sender account from Stellar Testnet
      const account = await server.loadAccount(walletAddress)

      // Build transaction
      const transaction = new TransactionBuilder(account, {
        fee: '100',
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount: amount,
          })
        )
        .setTimeout(180)
        .build()

      // Convert transaction to XDR
      const transactionXDR = transaction.toXDR()

      // Ask Freighter to sign the transaction
      const signedTransaction = await signTransaction(transactionXDR, {
        networkPassphrase: Networks.TESTNET,
      })

      if (signedTransaction.error) {
        setError(signedTransaction.error.message)
        setLoading(false)
        return
      }

      // Rebuild signed transaction
      const signedTx = TransactionBuilder.fromXDR(
        signedTransaction.signedTxXdr,
        Networks.TESTNET
      )

      // Submit transaction to Stellar Testnet
      const result = await server.submitTransaction(signedTx)

      setSuccess('XLM sent successfully! 🎉')
      setTransactionHash(result.hash)

      // Clear form
      setRecipient('')
      setAmount('')

      // Refresh balance after transaction
      await fetchBalance(walletAddress)

      setLoading(false)
    } catch (err) {
      console.error(err)
      setError('Transaction failed. Please check the address and balance.')
      setLoading(false)
    }
  }

  const refreshWalletBalance = async () => {
    if (!walletAddress) return

    setRefreshing(true)
    await fetchBalance(walletAddress)
    setRefreshing(false)
  }

  const disconnectWallet = () => {
    setWalletAddress('')
    setBalance('')
    setError('')
    setSuccess('')
    setTransactionHash('')
    setRecipient('')
    setAmount('')
  }

  return (
    <div className="app">
      <header className="navbar">
        <div className="logo">Stellar XLM Pay</div>

        {walletAddress ? (
          <button className="connect-btn" onClick={disconnectWallet}>
            Disconnect Wallet
          </button>
        ) : (
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </header>

      <main className="hero-section">
        <h1>Send XLM. Fast. Simple. Secure.</h1>

        <p className="subtitle">
          A simple Stellar payment app to connect your wallet,
          check your XLM balance, and send XLM on the Stellar Testnet.
        </p>

        <button className="primary-btn" onClick={connectWallet}>
          {walletAddress
            ? 'Wallet Connected'
            : 'Connect Freighter Wallet'}
        </button>

        {walletAddress && (
          <p className="wallet-address">
            Connected: {walletAddress}
          </p>
        )}

        {balance && (
          <div className="balance-card">
            <div className="balance-header">
              <span>💰</span>
              <span>XLM Balance</span>
            </div>

            <div className="balance-amount">
              {Number(balance).toFixed(2)} <span>XLM</span>
            </div>

            <p className="balance-network">
              Stellar Testnet
            </p>

            <button
              className="refresh-btn"
              onClick={refreshWalletBalance}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh Balance'}
            </button>
          </div>
        )}

        {success && (
          <div className="success-message">
            <p>{success}</p>

            {transactionHash && (
              <p>
                Transaction Hash:
                <br />
                <span>{transactionHash}</span>
              </p>
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
            onChange={(e) => setRecipient(e.target.value)}
          />

          <input
            type="number"
            placeholder="Amount in XLM"
            className="send-input"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />

          <button
            className="send-btn"
            onClick={sendXLM}
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send XLM'}
          </button>
        </section>
      )}

      <section className="features">
        <div className="feature-card">
          <h2>💳 Wallet</h2>
          <p>Connect your Freighter wallet securely.</p>
        </div>

        <div className="feature-card">
          <h2>💰 XLM Balance</h2>
          <p>View your current Stellar Testnet balance.</p>
        </div>

        <div className="feature-card">
          <h2>🚀 Send XLM</h2>
          <p>Send XLM transactions on the Stellar Testnet.</p>
        </div>
      </section>
    </div>
  )
}

export default App