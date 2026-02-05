// Example: How to Use the Theme System
// This file demonstrates theme usage patterns

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, useThemedStyles } from '@/infrastructure/theme';

// ============================================
// EXAMPLE 1: Using useTheme hook
// ============================================
export function Example1_BasicTheme() {
  const { theme, isDark, toggleTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background.primary, padding: theme.spacing[4] }}>
      <Text style={{ color: theme.text.primary, fontSize: 24 }}>
        Current mode: {isDark ? 'Dark' : 'Light'}
      </Text>
      
      <TouchableOpacity
        onPress={toggleTheme}
        style={{
          backgroundColor: theme.interactive.primary,
          padding: theme.spacing[3],
          borderRadius: theme.borderRadius.md,
          marginTop: theme.spacing[4],
        }}
      >
        <Text style={{ color: theme.text.inverse }}>
          Toggle Theme
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// EXAMPLE 2: Using useThemedStyles hook
// ============================================
export function Example2_ThemedStyles() {
  const { theme } = useTheme();
  
  // Create styles with theme
  const styles = useThemedStyles((theme) => ({
    container: {
      backgroundColor: theme.background.primary,
      padding: theme.spacing[4],
    },
    card: {
      backgroundColor: theme.surface.default,
      padding: theme.spacing[4],
      borderRadius: theme.borderRadius.lg,
      shadowColor: theme.shadow.medium,
    },
    title: {
      color: theme.text.primary,
      fontSize: 24,
      fontWeight: 'bold',
    },
    subtitle: {
      color: theme.text.secondary,
      fontSize: 16,
    },
  }));
  
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Card Title</Text>
        <Text style={styles.subtitle}>Card subtitle</Text>
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 3: Financial Colors
// ============================================
export function Example3_FinancialColors() {
  const { theme } = useTheme();
  
  return (
    <View style={{ padding: theme.spacing[4] }}>
      {/* Income */}
      <View style={{
        backgroundColor: theme.financial.incomeBackground,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing[2],
      }}>
        <Text style={{ color: theme.financial.income, fontWeight: 'bold' }}>
          + $2,500.00
        </Text>
        <Text style={{ color: theme.text.secondary }}>
          Salary - January
        </Text>
      </View>
      
      {/* Expense */}
      <View style={{
        backgroundColor: theme.financial.expenseBackground,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
        marginBottom: theme.spacing[2],
      }}>
        <Text style={{ color: theme.financial.expense, fontWeight: 'bold' }}>
          - $150.00
        </Text>
        <Text style={{ color: theme.text.secondary }}>
          Groceries
        </Text>
      </View>
      
      {/* Savings */}
      <View style={{
        backgroundColor: theme.financial.savingsBackground,
        padding: theme.spacing[3],
        borderRadius: theme.borderRadius.md,
      }}>
        <Text style={{ color: theme.financial.savings, fontWeight: 'bold' }}>
          $1,000.00
        </Text>
        <Text style={{ color: theme.text.secondary }}>
          Emergency Fund (Baby Step 1)
        </Text>
      </View>
    </View>
  );
}

// ============================================
// EXAMPLE 4: Status Colors
// ============================================
export function Example4_StatusColors() {
  const { theme } = useTheme();
  
  const statuses = [
    {
      type: 'success',
      bg: theme.status.successBackground,
      color: theme.status.success,
      text: 'Budget on track!',
    },
    {
      type: 'warning',
      bg: theme.status.warningBackground,
      color: theme.status.warning,
      text: '80% of budget used',
    },
    {
      type: 'error',
      bg: theme.status.errorBackground,
      color: theme.status.error,
      text: 'Over budget by $50',
    },
    {
      type: 'info',
      bg: theme.status.infoBackground,
      color: theme.status.info,
      text: 'Tip: Use envelope system',
    },
  ];
  
  return (
    <View style={{ padding: theme.spacing[4] }}>
      {statuses.map((status, index) => (
        <View
          key={index}
          style={{
            backgroundColor: status.bg,
            padding: theme.spacing[3],
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing[2],
            borderLeftWidth: 4,
            borderLeftColor: status.color,
          }}
        >
          <Text style={{ color: status.color, fontWeight: '600' }}>
            {status.text}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ============================================
// EXAMPLE 5: Buttons with Theme
// ============================================
export function Example5_Buttons() {
  const { theme } = useTheme();
  
  const buttonStyle = {
    padding: theme.spacing[3],
    borderRadius: theme.borderRadius.md,
    alignItems: 'center' as const,
    marginBottom: theme.spacing[2],
  };
  
  return (
    <View style={{ padding: theme.spacing[4] }}>
      {/* Primary Button */}
      <TouchableOpacity
        style={{
          ...buttonStyle,
          backgroundColor: theme.interactive.primary,
        }}
      >
        <Text style={{ color: theme.text.inverse, fontWeight: '600' }}>
          Primary Action
        </Text>
      </TouchableOpacity>
      
      {/* Secondary Button */}
      <TouchableOpacity
        style={{
          ...buttonStyle,
          backgroundColor: theme.interactive.secondary,
          borderWidth: 1,
          borderColor: theme.border.default,
        }}
      >
        <Text style={{ color: theme.text.primary, fontWeight: '600' }}>
          Secondary Action
        </Text>
      </TouchableOpacity>
      
      {/* Disabled Button */}
      <TouchableOpacity
        disabled
        style={{
          ...buttonStyle,
          backgroundColor: theme.interactive.primaryDisabled,
          opacity: 0.5,
        }}
      >
        <Text style={{ color: theme.text.inverse, fontWeight: '600' }}>
          Disabled Button
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// USAGE IN REAL COMPONENTS
// ============================================

/*
// In your screen components:

import { useTheme } from '@/infrastructure/theme';

export default function MyScreen() {
  const { theme } = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.background.primary }}>
      <Text style={{ color: theme.text.primary }}>Hello!</Text>
    </View>
  );
}

// Or with styled components:

const styles = useThemedStyles((theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background.primary,
    padding: theme.spacing[4],
  },
  card: {
    backgroundColor: theme.surface.default,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing[4],
  },
}));
*/

