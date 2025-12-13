// AmountInput Component - Homebase Budget
// Specialized input for currency amounts (stores as cents)

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Input } from './Input';
import { useTheme } from '@/infrastructure/theme';

interface AmountInputProps {
  label?: string;
  value: number; // Amount in cents
  onChangeValue: (cents: number) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  currency?: string;
  allowNegative?: boolean;
  maxAmount?: number; // Max in cents
  testID?: string;
}

export const AmountInput: React.FC<AmountInputProps> = ({
  label,
  value,
  onChangeValue,
  error,
  helperText,
  required = false,
  disabled = false,
  currency = '$',
  allowNegative = false,
  maxAmount,
  testID,
}) => {
  const { theme } = useTheme();
  const [displayValue, setDisplayValue] = useState('');

  // Convert cents to display string
  const centsToDisplay = (cents: number): string => {
    const dollars = Math.abs(cents) / 100;
    return dollars.toFixed(2);
  };

  // Convert display string to cents
  const displayToCents = (display: string): number => {
    // Remove all non-digit and non-decimal characters
    const cleaned = display.replace(/[^\d.]/g, '');
    
    // Parse as float and convert to cents
    const dollars = parseFloat(cleaned || '0');
    const cents = Math.round(dollars * 100);
    
    // Apply max amount limit
    if (maxAmount && cents > maxAmount) {
      return maxAmount;
    }
    
    return cents;
  };

  // Initialize display value from props
  useEffect(() => {
    setDisplayValue(centsToDisplay(value));
  }, [value]);

  const handleChangeText = (text: string) => {
    // Allow only numbers and one decimal point
    const cleaned = text.replace(/[^\d.]/g, '');
    
    // Ensure only one decimal point
    const parts = cleaned.split('.');
    let formatted = parts[0];
    if (parts.length > 1) {
      // Limit to 2 decimal places
      formatted = `${parts[0]}.${parts[1].slice(0, 2)}`;
    }

    setDisplayValue(formatted);
    
    // Convert to cents and notify parent
    const cents = displayToCents(formatted);
    onChangeValue(cents);
  };

  const handleBlur = () => {
    // Format to 2 decimal places on blur
    if (displayValue) {
      const cents = displayToCents(displayValue);
      setDisplayValue(centsToDisplay(cents));
    }
  };

  return (
    <View>
      <Input
        testID={testID}
        label={label}
        value={displayValue}
        onChangeText={handleChangeText}
        onBlur={handleBlur}
        error={error}
        helperText={helperText}
        required={required}
        disabled={disabled}
        keyboardType="numeric"
        placeholder="0.00"
        leftIcon={
          <Text
            style={{
              color: theme.text.secondary,
              fontSize: 18,
              fontWeight: '600',
            }}
          >
            {currency}
          </Text>
        }
        style={{
          fontSize: 18,
          fontWeight: '600',
        }}
      />
      
      {/* Display amount in cents for debugging (optional) */}
      {__DEV__ && (
        <Text
          style={{
            fontSize: 10,
            color: theme.text.tertiary,
            marginTop: 4,
          }}
        >
          Stored: {value} cents
        </Text>
      )}
    </View>
  );
};

// Helper function to format cents as currency string
export const formatCurrency = (
  cents: number,
  currency: string = '$',
  showSign: boolean = false
): string => {
  const dollars = cents / 100;
  const sign = showSign ? (cents >= 0 ? '+' : '-') : (cents < 0 ? '-' : '');
  const amount = Math.abs(dollars).toFixed(2);
  
  // Add thousands separators
  const [whole, decimal] = amount.split('.');
  const withCommas = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${sign}${currency}${withCommas}.${decimal}`;
};

// Helper to parse currency string to cents
export const parseCurrencyToCents = (currencyString: string): number => {
  const cleaned = currencyString.replace(/[^\d.-]/g, '');
  const dollars = parseFloat(cleaned || '0');
  return Math.round(dollars * 100);
};

