// Transactions Screen - Homebase Budget
// List and manage all transactions

import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { Card, PrimaryButton } from '@/presentation/components';

export default function TransactionsScreen() {
  const { theme } = useTheme();

  return (
    <ScrollView
      style={{
        flex: 1,
        backgroundColor: theme.background.primary,
      }}
    >
      <View style={{ padding: theme.spacing[4] }}>
        {/* Header */}
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: theme.text.primary,
            marginBottom: theme.spacing[2],
          }}
        >
          Transactions
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.text.secondary,
            marginBottom: theme.spacing[6],
          }}
        >
          Track every dollar
        </Text>

        {/* Add Transaction Button */}
        <PrimaryButton
          title="+ Add Transaction"
          onPress={() => {}}
          fullWidth
          size="lg"
          testID="add-transaction-button"
        />

        {/* Recent Transactions */}
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: theme.text.primary,
            marginTop: theme.spacing[6],
            marginBottom: theme.spacing[3],
          }}
        >
          Recent
        </Text>

        {/* Placeholder - will be replaced with real data */}
        <Card style={{ marginBottom: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
                Groceries
              </Text>
              <Text style={{ color: theme.text.secondary, fontSize: 14, marginTop: 4 }}>
                Dec 13, 2025
              </Text>
            </View>
            <Text style={{ color: theme.financial.expense, fontSize: 18, fontWeight: '600' }}>
              -$150.00
            </Text>
          </View>
        </Card>

        <Card style={{ marginBottom: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
                Salary
              </Text>
              <Text style={{ color: theme.text.secondary, fontSize: 14, marginTop: 4 }}>
                Dec 1, 2025
              </Text>
            </View>
            <Text style={{ color: theme.financial.income, fontSize: 18, fontWeight: '600' }}>
              +$2,500.00
            </Text>
          </View>
        </Card>

        <View
          style={{
            padding: theme.spacing[4],
            backgroundColor: theme.status.infoBackground,
            borderRadius: theme.borderRadius.md,
            marginTop: theme.spacing[4],
          }}
        >
          <Text style={{ color: theme.status.info, fontSize: 14 }}>
            💡 Coming soon: Transaction list with real Firestore data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

