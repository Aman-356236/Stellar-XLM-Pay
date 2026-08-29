export const networkConfig = {
  contractId:
    import.meta.env.VITE_HELLO_CONTRACT_ID ??
    'CBR2BJNOVWPBPZX44LH5YNXXJ3FAMZ4XTRHO3UVBYRDNQJBZUEVZAUXI',
  horizonUrl:
    import.meta.env.VITE_HORIZON_URL ??
    'https://horizon-testnet.stellar.org',
  rpcUrl:
    import.meta.env.VITE_SOROBAN_RPC_URL ??
    'https://soroban-testnet.stellar.org',
} as const
