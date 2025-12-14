// Currency formatting utilities
// Formats amounts according to household currency

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'INR' | 'MXN' | 'BRL' | 'KRW' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'THB' | 'IDR' | 'HUF' | 'CZK' | 'ILS' | 'CLP' | 'PHP' | 'AED' | 'SAR' | 'MYR' | 'RON' | 'HKD' | 'SGD' | 'NZD' | 'TRY' | 'RUB';

interface CurrencyConfig {
  symbol: string;
  code: string;
  decimals: number;
  position: 'before' | 'after';
}

const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { symbol: '$', code: 'USD', decimals: 2, position: 'before' },
  EUR: { symbol: '€', code: 'EUR', decimals: 2, position: 'before' },
  GBP: { symbol: '£', code: 'GBP', decimals: 2, position: 'before' },
  ZAR: { symbol: 'R', code: 'ZAR', decimals: 2, position: 'before' },
  JPY: { symbol: '¥', code: 'JPY', decimals: 0, position: 'before' },
  CNY: { symbol: '¥', code: 'CNY', decimals: 2, position: 'before' },
  AUD: { symbol: 'A$', code: 'AUD', decimals: 2, position: 'before' },
  CAD: { symbol: 'C$', code: 'CAD', decimals: 2, position: 'before' },
  CHF: { symbol: 'CHF', code: 'CHF', decimals: 2, position: 'before' },
  INR: { symbol: '₹', code: 'INR', decimals: 2, position: 'before' },
  MXN: { symbol: 'MX$', code: 'MXN', decimals: 2, position: 'before' },
  BRL: { symbol: 'R$', code: 'BRL', decimals: 2, position: 'before' },
  KRW: { symbol: '₩', code: 'KRW', decimals: 0, position: 'before' },
  SEK: { symbol: 'kr', code: 'SEK', decimals: 2, position: 'after' },
  NOK: { symbol: 'kr', code: 'NOK', decimals: 2, position: 'after' },
  DKK: { symbol: 'kr', code: 'DKK', decimals: 2, position: 'after' },
  PLN: { symbol: 'zł', code: 'PLN', decimals: 2, position: 'after' },
  THB: { symbol: '฿', code: 'THB', decimals: 2, position: 'before' },
  IDR: { symbol: 'Rp', code: 'IDR', decimals: 0, position: 'before' },
  HUF: { symbol: 'Ft', code: 'HUF', decimals: 0, position: 'after' },
  CZK: { symbol: 'Kč', code: 'CZK', decimals: 2, position: 'after' },
  ILS: { symbol: '₪', code: 'ILS', decimals: 2, position: 'before' },
  CLP: { symbol: 'CLP$', code: 'CLP', decimals: 0, position: 'before' },
  PHP: { symbol: '₱', code: 'PHP', decimals: 2, position: 'before' },
  AED: { symbol: 'د.إ', code: 'AED', decimals: 2, position: 'before' },
  SAR: { symbol: '﷼', code: 'SAR', decimals: 2, position: 'before' },
  MYR: { symbol: 'RM', code: 'MYR', decimals: 2, position: 'before' },
  RON: { symbol: 'lei', code: 'RON', decimals: 2, position: 'after' },
  HKD: { symbol: 'HK$', code: 'HKD', decimals: 2, position: 'before' },
  SGD: { symbol: 'S$', code: 'SGD', decimals: 2, position: 'before' },
  NZD: { symbol: 'NZ$', code: 'NZD', decimals: 2, position: 'before' },
  TRY: { symbol: '₺', code: 'TRY', decimals: 2, position: 'before' },
  RUB: { symbol: '₽', code: 'RUB', decimals: 2, position: 'before' },
};

/**
 * Format an amount with the specified currency
 * @param amount - The numeric amount (e.g., 1000)
 * @param currencyCode - The currency code (e.g., 'ZAR', 'USD')
 * @returns Formatted string (e.g., 'R1,000.00', '$1,000.00')
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD;
  
  // Format number with thousand separators and decimals
  const formattedAmount = amount.toLocaleString('en-US', {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  });
  
  // Position symbol before or after
  if (config.position === 'before') {
    return `${config.symbol}${formattedAmount}`;
  } else {
    return `${formattedAmount} ${config.symbol}`;
  }
}

/**
 * Get currency symbol for a currency code
 * @param currencyCode - The currency code (e.g., 'ZAR', 'USD')
 * @returns Symbol (e.g., 'R', '$')
 */
export function getCurrencySymbol(currencyCode: CurrencyCode = 'USD'): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD;
  return config.symbol;
}

/**
 * Parse a currency string back to a number (cents)
 * @param value - Formatted currency string (e.g., 'R1,000.00')
 * @returns Amount in cents
 */
export function parseCurrency(value: string): number {
  // Remove all non-digit and non-decimal characters
  const cleaned = value.replace(/[^\d.]/g, '');
  const amount = parseFloat(cleaned) || 0;
  return Math.round(amount * 100); // Convert to cents
}

