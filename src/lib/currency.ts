
export type CurrencyCode = 'GBP' | 'USD' | 'EUR'

export type ExchangeRates = {
  base: CurrencyCode
  rates: Partial<Record<CurrencyCode, number>>
  updatedAt: string
  source: string
}

export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  locale?: string
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  exchangeRates: ExchangeRates
): number | null {
  if (!Number.isFinite(amount)) return null

  if (from === to) return amount

  const baseRate = exchangeRates.rates[exchangeRates.base]
  const fromRate = exchangeRates.rates[from]
  const toRate = exchangeRates.rates[to]

  if (
    typeof baseRate !== 'number' ||
    typeof fromRate !== 'number' ||
    typeof toRate !== 'number' ||
    baseRate <= 0 ||
    fromRate <= 0 ||
    toRate <= 0
  ) {
    return null
  }

  return (amount / fromRate) * toRate
}
