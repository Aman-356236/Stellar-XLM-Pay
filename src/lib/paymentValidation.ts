export type PaymentValidationResult =
  | {
      valid: true
      cleanedAmount: string
      cleanedRecipient: string
    }
  | {
      valid: false
      error: string
    }

type PaymentInput = {
  amount: string
  balance: string
  recipient: string
  walletAddress: string
}

export function validatePayment({
  recipient,
  amount,
  walletAddress,
  balance,
}: PaymentInput): PaymentValidationResult {
  const cleanedRecipient = recipient.trim()

  if (!cleanedRecipient) {
    return { valid: false, error: 'Please enter a recipient address.' }
  }

  if (!cleanedRecipient.startsWith('G') || cleanedRecipient.length !== 56) {
    return {
      valid: false,
      error: 'Please enter a valid Stellar recipient address.',
    }
  }

  if (cleanedRecipient === walletAddress) {
    return { valid: false, error: 'You cannot send XLM to your own wallet.' }
  }

  const cleanedAmount = amount.trim()

  if (!cleanedAmount) {
    return { valid: false, error: 'Please enter an XLM amount.' }
  }

  const numericAmount = Number(cleanedAmount)
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return {
      valid: false,
      error: 'Please enter a valid XLM amount greater than 0.',
    }
  }

  const decimalPart = cleanedAmount.split('.')[1]
  if (decimalPart && decimalPart.length > 7) {
    return {
      valid: false,
      error: 'XLM amount cannot have more than 7 decimal places.',
    }
  }

  const currentBalance = Number(balance)
  if (!Number.isFinite(currentBalance)) {
    return {
      valid: false,
      error: 'Unable to read your current XLM balance.',
    }
  }

  if (numericAmount >= currentBalance) {
    return {
      valid: false,
      error: 'Insufficient XLM balance. Keep some XLM available for the transaction fee.',
    }
  }

  return { valid: true, cleanedAmount, cleanedRecipient }
}
