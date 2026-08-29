import { describe, expect, it } from 'vitest'

import { validatePayment } from './paymentValidation'

const SENDER = `G${'A'.repeat(55)}`
const RECIPIENT = `G${'B'.repeat(55)}`

describe('validatePayment', () => {
  const validInput = {
    recipient: RECIPIENT,
    amount: '1.25',
    walletAddress: SENDER,
    balance: '10',
  }

  it('accepts a valid payment and trims recipient whitespace', () => {
    expect(validatePayment({ ...validInput, recipient: ` ${RECIPIENT} ` })).toEqual({
      valid: true,
      cleanedAmount: '1.25',
      cleanedRecipient: RECIPIENT,
    })
  })

  it('rejects invalid Stellar recipient addresses', () => {
    expect(validatePayment({ ...validInput, recipient: 'not-a-wallet' })).toMatchObject({
      valid: false,
      error: 'Please enter a valid Stellar recipient address.',
    })
  })

  it('rejects self-payments', () => {
    expect(validatePayment({ ...validInput, recipient: SENDER })).toMatchObject({
      valid: false,
      error: 'You cannot send XLM to your own wallet.',
    })
  })

  it('rejects amounts with more than seven decimal places', () => {
    expect(validatePayment({ ...validInput, amount: '1.12345678' })).toMatchObject({
      valid: false,
      error: 'XLM amount cannot have more than 7 decimal places.',
    })
  })

  it('keeps a balance reserve for transaction fees', () => {
    expect(validatePayment({ ...validInput, amount: '10' })).toMatchObject({
      valid: false,
      error: 'Insufficient XLM balance. Keep some XLM available for the transaction fee.',
    })
  })
})
