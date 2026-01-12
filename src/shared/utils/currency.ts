// Currency formatting utilities
// Formats amounts according to household currency

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'ZAR' | 'JPY' | 'CNY' | 'AUD' | 'CAD' | 'CHF' | 'INR' | 'MXN' | 'BRL' | 'KRW' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'THB' | 'IDR' | 'HUF' | 'CZK' | 'ILS' | 'CLP' | 'PHP' | 'AED' | 'SAR' | 'MYR' | 'RON' | 'HKD' | 'SGD' | 'NZD' | 'TRY' | 'RUB';

interface CurrencyConfig {
  symbol: string;
  code: string;
  decimals: number;
  position: 'before' | 'after';
  exchangeRateToUSD: number; // Approximate rate (1 unit of this currency = X USD)
}

const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: { symbol: '$', code: 'USD', decimals: 2, position: 'before', exchangeRateToUSD: 1.0 },
  EUR: { symbol: '€', code: 'EUR', decimals: 2, position: 'before', exchangeRateToUSD: 1.08 },
  GBP: { symbol: '£', code: 'GBP', decimals: 2, position: 'before', exchangeRateToUSD: 1.27 },
  ZAR: { symbol: 'R', code: 'ZAR', decimals: 2, position: 'before', exchangeRateToUSD: 0.055 }, // ~18 ZAR = 1 USD
  JPY: { symbol: '¥', code: 'JPY', decimals: 0, position: 'before', exchangeRateToUSD: 0.0067 },
  CNY: { symbol: '¥', code: 'CNY', decimals: 2, position: 'before', exchangeRateToUSD: 0.14 },
  AUD: { symbol: 'A$', code: 'AUD', decimals: 2, position: 'before', exchangeRateToUSD: 0.64 },
  CAD: { symbol: 'C$', code: 'CAD', decimals: 2, position: 'before', exchangeRateToUSD: 0.72 },
  CHF: { symbol: 'CHF', code: 'CHF', decimals: 2, position: 'before', exchangeRateToUSD: 1.13 },
  INR: { symbol: '₹', code: 'INR', decimals: 2, position: 'before', exchangeRateToUSD: 0.012 },
  MXN: { symbol: 'MX$', code: 'MXN', decimals: 2, position: 'before', exchangeRateToUSD: 0.05 },
  BRL: { symbol: 'R$', code: 'BRL', decimals: 2, position: 'before', exchangeRateToUSD: 0.20 },
  KRW: { symbol: '₩', code: 'KRW', decimals: 0, position: 'before', exchangeRateToUSD: 0.00075 },
  SEK: { symbol: 'kr', code: 'SEK', decimals: 2, position: 'after', exchangeRateToUSD: 0.095 },
  NOK: { symbol: 'kr', code: 'NOK', decimals: 2, position: 'after', exchangeRateToUSD: 0.093 },
  DKK: { symbol: 'kr', code: 'DKK', decimals: 2, position: 'after', exchangeRateToUSD: 0.145 },
  PLN: { symbol: 'zł', code: 'PLN', decimals: 2, position: 'after', exchangeRateToUSD: 0.25 },
  THB: { symbol: '฿', code: 'THB', decimals: 2, position: 'before', exchangeRateToUSD: 0.029 },
  IDR: { symbol: 'Rp', code: 'IDR', decimals: 0, position: 'before', exchangeRateToUSD: 0.000063 },
  HUF: { symbol: 'Ft', code: 'HUF', decimals: 0, position: 'after', exchangeRateToUSD: 0.0027 },
  CZK: { symbol: 'Kč', code: 'CZK', decimals: 2, position: 'after', exchangeRateToUSD: 0.043 },
  ILS: { symbol: '₪', code: 'ILS', decimals: 2, position: 'before', exchangeRateToUSD: 0.27 },
  CLP: { symbol: 'CLP$', code: 'CLP', decimals: 0, position: 'before', exchangeRateToUSD: 0.0010 },
  PHP: { symbol: '₱', code: 'PHP', decimals: 2, position: 'before', exchangeRateToUSD: 0.018 },
  AED: { symbol: 'د.إ', code: 'AED', decimals: 2, position: 'before', exchangeRateToUSD: 0.27 },
  SAR: { symbol: '﷼', code: 'SAR', decimals: 2, position: 'before', exchangeRateToUSD: 0.27 },
  MYR: { symbol: 'RM', code: 'MYR', decimals: 2, position: 'before', exchangeRateToUSD: 0.22 },
  RON: { symbol: 'lei', code: 'RON', decimals: 2, position: 'after', exchangeRateToUSD: 0.22 },
  HKD: { symbol: 'HK$', code: 'HKD', decimals: 2, position: 'before', exchangeRateToUSD: 0.13 },
  SGD: { symbol: 'S$', code: 'SGD', decimals: 2, position: 'before', exchangeRateToUSD: 0.74 },
  NZD: { symbol: 'NZ$', code: 'NZD', decimals: 2, position: 'before', exchangeRateToUSD: 0.59 },
  TRY: { symbol: '₺', code: 'TRY', decimals: 2, position: 'before', exchangeRateToUSD: 0.029 },
  RUB: { symbol: '₽', code: 'RUB', decimals: 2, position: 'before', exchangeRateToUSD: 0.010 },
};

/**
 * Format an amount with the specified currency
 * @param amount - The numeric amount in CENTS (e.g., 5522 for R55.22)
 * @param currencyCode - The currency code (e.g., 'ZAR', 'USD')
 * @returns Formatted string (e.g., 'R55.22', '$1,000.00')
 */
export function formatCurrency(amount: number, currencyCode: CurrencyCode = 'USD'): string {
  const config = CURRENCY_CONFIGS[currencyCode] || CURRENCY_CONFIGS.USD;
  
  // Convert cents to base currency units (dollars, rands, etc.)
  // For currencies with 2 decimals: divide by 100
  // For currencies with 0 decimals (JPY, KRW): divide by 1 (amount is already in base units)
  const baseAmount = config.decimals === 0 ? amount : amount / 100;
  
  // Format number with thousand separators and decimals
  const formattedAmount = baseAmount.toLocaleString('en-US', {
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

/**
 * Convert USD amount to target currency
 * @param usdAmount - Amount in USD (e.g., 1000)
 * @param targetCurrency - Target currency code
 * @returns Equivalent amount in target currency (e.g., 18000 for ZAR)
 */
export function convertFromUSD(usdAmount: number, targetCurrency: CurrencyCode): number {
  const targetConfig = CURRENCY_CONFIGS[targetCurrency] || CURRENCY_CONFIGS.USD;
  
  // If target is USD, no conversion needed
  if (targetCurrency === 'USD') {
    return usdAmount;
  }
  
  // Convert: USD amount / exchange rate to USD = target amount
  // Example: $1000 / 0.055 (ZAR rate) = R18,181.82
  const convertedAmount = usdAmount / targetConfig.exchangeRateToUSD;
  
  // Round to currency's decimal places
  const multiplier = Math.pow(10, targetConfig.decimals);
  return Math.round(convertedAmount * multiplier) / multiplier;
}

