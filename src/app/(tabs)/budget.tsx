// Budget Screen - Homebase Budget
// Zero-based budgeting interface

import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { Card, PrimaryButton, SecondaryButton } from '@/presentation/components';

export default function BudgetScreen() {
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
          December 2025 Budget
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.text.secondary,
            marginBottom: theme.spacing[4],
          }}
        >
          Every dollar has a job
        </Text>

        {/* Budget Summary Card */}
        <Card style={{ marginBottom: theme.spacing[4] }} padding="lg">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[3] }}>
            <Text style={{ color: theme.text.secondary, fontSize: 16 }}>
              Planned Income
            </Text>
            <Text style={{ color: theme.financial.income, fontSize: 18, fontWeight: '600' }}>
              $2,500.00
            </Text>
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[3] }}>
            <Text style={{ color: theme.text.secondary, fontSize: 16 }}>
              Planned Expenses
            </Text>
            <Text style={{ color: theme.financial.expense, fontSize: 18, fontWeight: '600' }}>
              $2,500.00
            </Text>
          </View>

          <View
            style={{
              height: 1,
              backgroundColor: theme.border.default,
              marginVertical: theme.spacing[3],
            }}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: theme.text.primary, fontSize: 18, fontWeight: 'bold' }}>
              Difference
            </Text>
            <Text style={{ color: theme.status.success, fontSize: 20, fontWeight: 'bold' }}>
              $0.00
            </Text>
          </View>

          <View
            style={{
              marginTop: theme.spacing[3],
              padding: theme.spacing[2],
              backgroundColor: theme.status.successBackground,
              borderRadius: theme.borderRadius.sm,
            }}
          >
            <Text style={{ color: theme.status.success, fontSize: 14, textAlign: 'center' }}>
              ✅ Zero-based budget!
            </Text>
          </View>
        </Card>

        {/* Category Groups */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Categories
        </Text>

        {/* Giving */}
        <Card style={{ marginBottom: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              Giving
            </Text>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              $250 / $250
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: theme.background.tertiary,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: '100%',
                backgroundColor: theme.status.success,
              }}
            />
          </View>
        </Card>

        {/* Housing */}
        <Card style={{ marginBottom: theme.spacing[3] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              Housing
            </Text>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              $800 / $1,000
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: theme.background.tertiary,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: '80%',
                backgroundColor: theme.status.warning,
              }}
            />
          </View>
        </Card>

        {/* Food */}
        <Card style={{ marginBottom: theme.spacing[6] }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: theme.spacing[2] }}>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              Food
            </Text>
            <Text style={{ color: theme.text.primary, fontSize: 16, fontWeight: '600' }}>
              $150 / $500
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: theme.background.tertiary,
              borderRadius: theme.borderRadius.full,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: '100%',
                width: '30%',
                backgroundColor: theme.status.success,
              }}
            />
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={{ gap: theme.spacing[3] }}>
          <PrimaryButton title="+ Add Category" onPress={() => {}} fullWidth />
          <SecondaryButton title="Copy Last Month" onPress={() => {}} fullWidth />
        </View>

        <View
          style={{
            marginTop: theme.spacing[6],
            padding: theme.spacing[4],
            backgroundColor: theme.status.infoBackground,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <Text style={{ color: theme.status.info, fontSize: 14 }}>
            💡 Coming soon: Full zero-based budgeting with real data
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

