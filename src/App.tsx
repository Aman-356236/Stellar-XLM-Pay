import {
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  rpc,
  nativeToScVal,
  scValToNative,
} from '@stellar/stellar-sdk'

import {
  validatePayment,
} from './lib/paymentValidation'

import {
  networkConfig,
} from './config/network'

import './App.css'

StellarWalletsKit.init({
  modules: defaultModules(),
})

StellarWalletsKit.setNetwork(
  Networks.TESTNET,
)

function App() {
  const [walletAddress, setWalletAddress] =
    useState('')

  const [balance, setBalance] =
    useState('')

  const [error, setError] =
    useState('')

  const [success, setSuccess] =
    useState('')

  const [transactionHash, setTransactionHash] =
    useState('')

  const [recipient, setRecipient] =
    useState('')

  const [amount, setAmount] =
    useState('')

  const [loading, setLoading] =
    useState(false)

  const [connectingWallet, setConnectingWallet] =
    useState(false)

  const [refreshing, setRefreshing] =
    useState(false)

  const [copied, setCopied] =
    useState(false)

  const [walletCopied, setWalletCopied] =
    useState(false)

  const [transactionStatus, setTransactionStatus] =
    useState('')

  const [contractMessage, setContractMessage] =
    useState('')

  const [contractReturnValue, setContractReturnValue] =
    useState('')

  const [contractEvent, setContractEvent] =
    useState('')

  const [contractEventHash, setContractEventHash] =
    useState('')

  const [contractEventLedger, setContractEventLedger] =
    useState('')

  const [contractEventStatus, setContractEventStatus] =
    useState('Waiting for contract events...')

  const [contractLoading, setContractLoading] =
    useState(false)

  const server = useMemo(() =>
    new Horizon.Server(
      networkConfig.horizonUrl,
    ), [])

  const rpcServer = useMemo(() =>
    new rpc.Server(
      networkConfig.rpcUrl,
    ), [])

  const eventSeenIds =
    useRef<Set<string>>(
      new Set(),
    )

  const eventStartedLedger =
    useRef<number | null>(
      null,
    )

  const clearMessages = () => {
    setError('')
    setSuccess('')
    setTransactionHash('')
    setCopied(false)
    setTransactionStatus('')
  }

  const fetchBalance = async (
    address: string,
  ) => {
    try {
      setError('')

      const account =
        await server.loadAccount(
          address,
        )

      const xlmBalance =
        account.balances.find(
          (item) =>
            item.asset_type === 'native',
        )

      setBalance(
        xlmBalance
          ? xlmBalance.balance
          : '0',
      )
    } catch (err) {
      console.error(err)

      setError(
        'Unable to fetch wallet balance. Please check the wallet or network.',
      )
    }
  }

  const connectWallet = async () => {
    if (
      connectingWallet ||
      loading ||
      contractLoading
    ) {
      return
    }

    try {
      setConnectingWallet(true)

      setError('')
      setSuccess('')
      setTransactionHash('')
      setCopied(false)
      setWalletCopied(false)

      setTransactionStatus(
        'Opening wallet selection...',
      )

      const response =
        await StellarWalletsKit.authModal()

      if (!response?.address) {
        setError(
          'Wallet connection was rejected or no wallet was selected.',
        )

        setTransactionStatus('')

        return
      }

      setWalletAddress(
        response.address,
      )

      setTransactionStatus(
        'Wallet connected. Fetching balance...',
      )

      await fetchBalance(
        response.address,
      )

      setTransactionStatus('')

      setSuccess(
        'Wallet connected successfully!',
      )
    } catch (err) {
      console.error(err)

      const message =
        err instanceof Error
          ? err.message.toLowerCase()
          : ''

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
    } finally {
      setConnectingWallet(false)
    }
  }

  const sendXLM = async () => {
    try {
      clearMessages()

      if (!walletAddress) {
        setError(
          'Please connect your wallet first.',
        )
        return
      }

      const payment = validatePayment({
        recipient,
        amount,
        walletAddress,
        balance,
      })

      if (!payment.valid) {
        setError(payment.error)
        return
      }

      const { cleanedAmount, cleanedRecipient } = payment

      setLoading(true)

      setTransactionStatus(
        'Preparing transaction...',
      )

      const account =
        await server.loadAccount(
          walletAddress,
        )

      const transaction =
        new TransactionBuilder(
          account,
          {
            fee: '100',
            networkPassphrase:
              Networks.TESTNET,
          },
        )
          .addOperation(
            Operation.payment({
              destination:
                cleanedRecipient,
              asset:
                Asset.native(),
              amount:
                cleanedAmount,
            }),
          )
          .setTimeout(180)
          .build()

      const transactionXDR =
        transaction.toXDR()

      setTransactionStatus(
        'Waiting for wallet approval...',
      )

      const signedTransaction =
        await StellarWalletsKit.signTransaction(
          transactionXDR,
          {
            networkPassphrase:
              Networks.TESTNET,
            address:
              walletAddress,
          },
        )

      if (
        !signedTransaction?.signedTxXdr
      ) {
        throw new Error(
          'Transaction signing was rejected or failed.',
        )
      }

      setTransactionStatus(
        'Submitting transaction...',
      )

      const signedTx =
        TransactionBuilder.fromXDR(
          signedTransaction.signedTxXdr,
          Networks.TESTNET,
        )

      const result =
        await server.submitTransaction(
          signedTx,
        )

      setSuccess(
        'XLM sent successfully!',
      )

      setTransactionHash(
        result.hash,
      )

      setTransactionStatus(
        'Transaction confirmed successfully!',
      )

      setRecipient('')
      setAmount('')

      await fetchBalance(
        walletAddress,
      )
    } catch (err) {
      console.error(err)

      const message =
        err instanceof Error
          ? err.message.toLowerCase()
          : ''

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

  const callHelloContract =
    async () => {
      try {
        setError('')
        setSuccess('')
        setContractMessage('')
        setContractReturnValue('')
        setTransactionHash('')
        setCopied(false)

        if (!walletAddress) {
          setError(
            'Please connect your wallet first.',
          )
          return
        }

        setContractLoading(true)

        setTransactionStatus(
          'Preparing smart contract call...',
        )

        const account =
          await server.loadAccount(
            walletAddress,
          )

        const helloArgument =
          nativeToScVal(
            'Aman',
            {
              type: 'string',
            },
          )

        const contractOperation =
          Operation.invokeContractFunction({
            contract:
              networkConfig.contractId,
            function:
              'hello',
            args: [
              helloArgument,
            ],
          })

        const transaction =
          new TransactionBuilder(
            account,
            {
              fee: '100',
              networkPassphrase:
                Networks.TESTNET,
            },
          )
            .addOperation(
              contractOperation,
            )
            .setTimeout(180)
            .build()

        setTransactionStatus(
          'Simulating contract call...',
        )

        const simulation =
          await rpcServer.simulateTransaction(
            transaction,
          )

        if (
          rpc.Api.isSimulationError(
            simulation,
          )
        ) {
          throw new Error(
            String(
              simulation.error,
            ),
          )
        }

        if (
          simulation.result?.retval
        ) {
          try {
            const simulatedValue =
              scValToNative(
                simulation.result.retval,
              )

            setContractReturnValue(
              JSON.stringify(
                simulatedValue,
                (_, value) =>
                  typeof value ===
                  'bigint'
                    ? value.toString()
                    : value,
              ),
            )
          } catch (decodeError) {
            console.error(
              'RETURN VALUE DECODE ERROR:',
              decodeError,
            )
          }
        }

        const preparedTransaction =
          await rpcServer.prepareTransaction(
            transaction,
          )

        const transactionXDR =
          preparedTransaction.toXDR()

        setTransactionStatus(
          'Waiting for wallet approval...',
        )

        const signedTransaction =
          await StellarWalletsKit.signTransaction(
            transactionXDR,
            {
              networkPassphrase:
                Networks.TESTNET,
              address:
                walletAddress,
            },
          )

        if (
          !signedTransaction?.signedTxXdr
        ) {
          throw new Error(
            'Smart contract transaction signing was rejected.',
          )
        }

        setTransactionStatus(
          'Submitting smart contract transaction...',
        )

        const signedTx =
          TransactionBuilder.fromXDR(
            signedTransaction.signedTxXdr,
            Networks.TESTNET,
          )

        const sendResponse =
          await rpcServer.sendTransaction(
            signedTx,
          )

        if (
          sendResponse.status ===
          'ERROR'
        ) {
          throw new Error(
            `Smart contract transaction rejected: ${JSON.stringify(
              sendResponse,
            )}`,
          )
        }

        setTransactionStatus(
          'Waiting for contract confirmation...',
        )

        const finalResponse =
          await rpcServer.pollTransaction(
            sendResponse.hash,
            {
              sleepStrategy:
                () =>
                  2000,
              attempts: 30,
            },
          )

        if (
          finalResponse.status !==
          'SUCCESS'
        ) {
          throw new Error(
            `Smart contract transaction failed: ${JSON.stringify(
              finalResponse,
            )}`,
          )
        }

        if (
          finalResponse.returnValue
        ) {
          try {
            const actualReturn =
              scValToNative(
                finalResponse.returnValue,
              )

            setContractReturnValue(
              JSON.stringify(
                actualReturn,
                (_, value) =>
                  typeof value ===
                  'bigint'
                    ? value.toString()
                    : value,
              ),
            )

            if (
              Array.isArray(
                actualReturn,
              )
            ) {
              const first =
                actualReturn[0]

              const second =
                actualReturn[1]

              if (
                typeof first ===
                'string' &&
                typeof second ===
                'string'
              ) {
                setContractMessage(
                  `${first}, ${second}`,
                )
              } else {
                setContractMessage(
                  'Contract returned a value successfully.',
                )
              }
            } else {
              setContractMessage(
                String(
                  actualReturn,
                ),
              )
            }
          } catch (decodeError) {
            console.error(
              'ACTUAL RETURN VALUE ERROR:',
              decodeError,
            )

            setContractMessage(
              'Contract returned successfully.',
            )
          }
        } else {
          setContractMessage(
            'Contract executed successfully.',
          )
        }

        setTransactionHash(
          sendResponse.hash,
        )

        setSuccess(
          'Smart contract called successfully!',
        )

        setTransactionStatus(
          'Contract transaction confirmed successfully!',
        )
      } catch (err) {
        console.error(
          'SMART CONTRACT ERROR:',
          err,
        )

        const message =
          err instanceof Error
            ? err.message
            : String(err)

        setError(
          `Smart contract error: ${message}`,
        )

        setTransactionStatus('')
      } finally {
        setContractLoading(false)
      }
    }

  const copyTransactionHash =
    async () => {
      if (!transactionHash)
        return

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

        setError(
          'Failed to copy transaction hash.',
        )
      }
    }

  const copyWalletAddress =
    async () => {
      if (!walletAddress)
        return

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

        setError(
          'Failed to copy wallet address.',
        )
      }
    }

  const refreshWalletBalance =
    async () => {
      if (!walletAddress)
        return

      try {
        setRefreshing(true)

        await fetchBalance(
          walletAddress,
        )
      } finally {
        setRefreshing(false)
      }
    }

  const disconnectWallet =
    async () => {
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
      setContractMessage('')
      setContractReturnValue('')
      setContractEvent('')
      setContractEventHash('')
      setContractEventLedger('')
      setContractEventStatus(
        'Waiting for contract events...',
      )
    }

  const pollContractEvents = useCallback(
    async () => {
      try {
        const latestLedgerResponse =
          await rpcServer.getLatestLedger()

        const latestLedger =
          latestLedgerResponse.sequence

        if (
          eventStartedLedger.current ===
          null
        ) {
          eventStartedLedger.current =
            Math.max(
              1,
              latestLedger - 5,
            )
        }

        const startLedger =
          eventStartedLedger.current

        if (
          startLedger >
          latestLedger
        ) {
          return
        }

        const response =
          await rpcServer.getEvents({
            startLedger,
            filters: [
              {
                type: 'contract',
                contractIds: [
                  networkConfig.contractId,
                ],
              },
            ],
            limit: 100,
          })

        for (
          const event of response.events
        ) {
          if (
            eventSeenIds.current.has(
              event.id,
            )
          ) {
            continue
          }

          eventSeenIds.current.add(
            event.id,
          )

          try {
            const eventValue =
              scValToNative(
              event.value,
              )

            const readableEvent =
              JSON.stringify(
                eventValue,
                (_, value) =>
                  typeof value ===
                  'bigint'
                    ? value.toString()
                    : value,
              )

            setContractEvent(
              readableEvent,
            )
          } catch (decodeError) {
            console.error(
              'EVENT DECODE ERROR:',
              decodeError,
            )

            setContractEvent(
              'Contract event received successfully.',
            )
          }

          setContractEventHash(
            event.txHash,
          )

          setContractEventLedger(
            String(
              event.ledger,
            ),
          )

          setContractEventStatus(
            'Live contract event received!',
          )
        }

        eventStartedLedger.current =
          Math.max(
            startLedger,
            latestLedger,
          )
      } catch (err) {
        console.error(
          'CONTRACT EVENT ERROR:',
          err,
        )

        setContractEventStatus(
          'Event listener reconnecting...',
        )
      }
    },
    [rpcServer],
  )

  useEffect(() => {
    let active = true
    let timeoutId:
      ReturnType<typeof setTimeout> |
      undefined

    const listenForEvents =
      async () => {
        if (!active) return

        await pollContractEvents()

        if (!active) return

        timeoutId =
          setTimeout(
            listenForEvents,
            4000,
          )
      }

    listenForEvents()

    return () => {
      active = false

      if (timeoutId) {
        clearTimeout(
          timeoutId,
        )
      }
    }
  }, [pollContractEvents])

  const shortWalletAddress =
    walletAddress
      ? `${walletAddress.slice(
          0,
          6,
        )}...${walletAddress.slice(-6)}`
      : ''

  return (
    <div className="app">
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">
            ✦
          </div>

          <div>
            <div className="logo">
              Stellar XLM Pay
            </div>

            <div className="brand-subtitle">
              Soroban Payment dApp
            </div>
          </div>
        </div>

        {walletAddress ? (
          <button
            className="connect-btn connected"
            onClick={
              disconnectWallet
            }
            disabled={
              loading ||
              connectingWallet ||
              contractLoading
            }
          >
            <span className="online-dot" />
            Disconnect
          </button>
        ) : (
          <button
            className="connect-btn"
            onClick={
              connectWallet
            }
            disabled={
              loading ||
              connectingWallet
            }
          >
            {connectingWallet
              ? 'Opening Wallets...'
              : 'Connect Wallet'}
          </button>
        )}
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-badge">
            <span className="badge-dot" />
            Stellar Testnet
          </div>

          <h1>
            Send XLM.
            <span>
              {' '}
              Fast. Simple. Secure.
            </span>
          </h1>

          <p className="subtitle">
            A modern Stellar payment dApp
            with multi-wallet support,
            real-time balance tracking,
            XLM transfers, and Soroban
            smart contract integration.
          </p>

          {!walletAddress && (
            <button
              className="primary-btn"
              onClick={
                connectWallet
              }
              disabled={
                loading ||
                connectingWallet
              }
            >
              {connectingWallet
                ? 'Opening Wallets...'
                : 'Connect Stellar Wallet'}
              <span>→</span>
            </button>
          )}

          {walletAddress && (
            <div className="wallet-address">
              <div className="wallet-label">
                <span className="online-dot" />
                Connected Wallet
              </div>

              <div className="wallet-display">
                <span className="wallet-short-address">
                  {shortWalletAddress}
                </span>

                <button
                  type="button"
                  className="wallet-copy-btn"
                  onClick={
                    copyWalletAddress
                  }
                >
                  {walletCopied
                    ? '✓ Copied'
                    : '📋 Copy'}
                </button>
              </div>

              <p className="balance-network">
                Connected through Stellar
                Wallets Kit
              </p>
            </div>
          )}
        </section>

        {walletAddress && (
          <section className="dashboard-grid">
            <div className="balance-card">
              <div className="card-top">
                <div className="card-icon">
                  ◈
                </div>

                <span className="card-label">
                  Available Balance
                </span>

                <span className="network-pill">
                  TESTNET
                </span>
              </div>

              <div className="balance-amount">
                {Number(
                  balance || 0,
                ).toFixed(2)}
                <span>
                  {' '}
                  XLM
                </span>
              </div>

              <div className="balance-footer">
                <span>
                  Stellar Testnet
                </span>

                <button
                  className="refresh-btn"
                  onClick={
                    refreshWalletBalance
                  }
                  disabled={
                    refreshing ||
                    loading ||
                    contractLoading
                  }
                >
                  {refreshing
                    ? '↻ Refreshing...'
                    : '↻ Refresh'}
                </button>
              </div>
            </div>

            <div className="contract-card">
              <div className="contract-header">
                <div className="contract-icon">
                  ◇
                </div>

                <div>
                  <h2>
                    Soroban Contract
                  </h2>

                  <span>
                    Smart contract integration
                  </span>
                </div>
              </div>

              <p>
                Execute the deployed
                <strong>
                  {' '}
                  hello{' '}
                </strong>
                function using your connected
                Stellar wallet.
              </p>

              <button
                className="contract-btn"
                onClick={
                  callHelloContract
                }
                disabled={
                  contractLoading ||
                  loading
                }
              >
                {contractLoading
                  ? 'Calling Contract...'
                  : 'Call Hello Contract'}
                {!contractLoading && (
                  <span>→</span>
                )}
              </button>

              {contractMessage && (
                <div className="contract-result">
                  <span>✓</span>
                  {contractMessage}
                </div>
              )}

              {contractReturnValue && (
                <div className="contract-result">
                  <span>↳</span>

                  <div>
                    <strong>
                      Actual Return Value
                    </strong>

                    <div>
                      {contractReturnValue}
                    </div>
                  </div>
                </div>
              )}

              <div className="contract-result">
                <span>
                  {contractEventStatus.includes(
                    'Live',
                  )
                    ? '●'
                    : '◌'}
                </span>

                <div>
                  <strong>
                    Real-time Event
                  </strong>

                  <div>
                    {contractEventStatus}
                  </div>

                  {contractEvent && (
                    <div>
                      Event Data:{' '}
                      {contractEvent}
                    </div>
                  )}

                  {contractEventLedger && (
                    <div>
                      Ledger:{' '}
                      {contractEventLedger}
                    </div>
                  )}

                  {contractEventHash && (
                    <div className="transaction-hash">
                      Tx:{' '}
                      {contractEventHash}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {transactionStatus &&
          !success && (
            <div className="transaction-status">
              <span className="status-spinner">
                ⏳
              </span>

              <span>
                {transactionStatus}
              </span>
            </div>
          )}

        {success && (
          <div className="success-message">
            <div className="success-icon">
              ✓
            </div>

            <div className="success-content">
              <p className="success-title">
                {success}
              </p>

              {transactionStatus && (
                <p className="transaction-confirmed">
                  {transactionStatus}
                </p>
              )}

              {transactionHash && (
                <div className="transaction-result">
                  <p className="transaction-title">
                    Transaction Hash
                  </p>

                  <p className="transaction-hash">
                    {transactionHash}
                  </p>

                  <button
                    type="button"
                    className="copy-btn"
                    onClick={
                      copyTransactionHash
                    }
                  >
                    {copied
                      ? '✓ Copied!'
                      : '📋 Copy Hash'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">
              !
            </span>

            <span>{error}</span>
          </div>
        )}

        {walletAddress && (
          <section className="send-section">
            <div className="section-heading">
              <div>
                <span className="section-kicker">
                  PAYMENT
                </span>

                <h2>
                  Send XLM
                </h2>

                <p>
                  Transfer native Stellar
                  Lumens to another wallet.
                </p>
              </div>

              <div className="payment-icon">
                ↗
              </div>
            </div>

            <div className="input-group">
              <label>
                Recipient Address
              </label>

              <input
                type="text"
                placeholder="G... Stellar wallet address"
                className="send-input"
                value={recipient}
                onChange={(e) =>
                  setRecipient(
                    e.target.value,
                  )
                }
                disabled={loading}
              />
            </div>

            <div className="input-group">
              <label>
                Amount
              </label>

              <div className="amount-wrapper">
                <input
                  type="number"
                  placeholder="0.00"
                  className="send-input amount-input"
                  min="0"
                  step="0.0000001"
                  value={amount}
                  onChange={(e) =>
                    setAmount(
                      e.target.value,
                    )
                  }
                  disabled={loading}
                />

                <span className="amount-unit">
                  XLM
                </span>
              </div>
            </div>

            <button
              className="send-btn"
              onClick={
                sendXLM
              }
              disabled={loading}
            >
              {loading
                ? 'Processing Transaction...'
                : 'Send XLM'}
              {!loading && (
                <span>→</span>
              )}
            </button>

            <div className="fee-note">
              <span>ⓘ</span>
              Network fee is paid in XLM.
              Keep a small balance available
              for transaction fees.
            </div>
          </section>
        )}

        <section className="features-section">
          <div className="section-title">
            <span className="section-kicker">
              FEATURES
            </span>

            <h2>
              Built for Stellar
            </h2>

            <p>
              Everything you need for a
              simple Testnet payment
              experience.
            </p>
          </div>

          <div className="features">
            <div className="feature-card">
              <div className="feature-icon">
                👛
              </div>

              <h2>
                Multi-Wallet
              </h2>

              <p>
                Connect supported Stellar
                wallets through Stellar
                Wallets Kit.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                ◈
              </div>

              <h2>
                Live Balance
              </h2>

              <p>
                View and refresh your
                current Stellar Testnet
                XLM balance.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                ↗
              </div>

              <h2>
                Fast Payments
              </h2>

              <p>
                Send XLM directly from your
                connected wallet.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                ◇
              </div>

              <h2>
                Soroban
              </h2>

              <p>
                Interact with a deployed
                smart contract from the
                frontend.
              </p>
            </div>
          </div>
        </section>

        <section className="network-info">
          <div className="network-info-card">
            <div className="network-heading">
              <div className="network-icon">
                🌐
              </div>

              <div>
                <span className="section-kicker">
                  CONFIGURATION
                </span>

                <h2>
                  Network Information
                </h2>
              </div>
            </div>

            <div className="network-grid">
              <div>
                <span>
                  Network
                </span>

                <strong>
                  Stellar Testnet
                </strong>
              </div>

              <div>
                <span>
                  Smart Contract
                </span>

                <strong>
                  Soroban
                </strong>
              </div>

              <div>
                <span>
                  RPC
                </span>

                <strong>
                  Soroban Testnet
                </strong>
              </div>

              <div>
                <span>
                  Function
                </span>

                <strong>
                  hello
                </strong>
              </div>
            </div>

            <div className="contract-address">
              <span>
                Contract ID
              </span>

              <code>
                {networkConfig.contractId}
              </code>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div>
          <strong>
            Stellar XLM Pay
          </strong>

          <span>
            Built on Stellar Testnet
          </span>
        </div>

        <span>
          Soroban • XLM • Web3
        </span>
      </footer>
    </div>
  )
}

export default App
