// Components Demo Screen
// Shows all UI components in action with Homebase theme

import React, { useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  OutlineButton,
  GhostButton,
  Card,
  ElevatedCard,
  OutlinedCard,
  Input,
  AmountInput,
  formatCurrency,
} from '@/presentation/components';

export default function ComponentsDemoScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [textValue, setTextValue] = useState('');
  const [amount, setAmount] = useState(25000); // $250.00 in cents

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
          UI Components
        </Text>
        <Text
          style={{
            fontSize: 16,
            color: theme.text.secondary,
            marginBottom: theme.spacing[6],
          }}
        >
          Homebase Budget design system showcase
        </Text>

        {/* Theme Toggle */}
        <Card padding="md" style={{ marginBottom: theme.spacing[4] }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '600',
              color: theme.text.primary,
              marginBottom: theme.spacing[3],
            }}
          >
            Theme: {isDark ? 'Dark' : 'Light'} Mode
          </Text>
          <Button title="Toggle Theme" onPress={toggleTheme} size="sm" />
        </Card>

        {/* Buttons Section */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Buttons
        </Text>

        <Card padding="lg" style={{ marginBottom: theme.spacing[4] }}>
          <View style={{ gap: theme.spacing[3] }}>
            <PrimaryButton title="Primary Button" onPress={() => {}} />
            <SecondaryButton title="Secondary Button" onPress={() => {}} />
            <OutlineButton title="Outline Button" onPress={() => {}} />
            <GhostButton title="Ghost Button" onPress={() => {}} />
            
            <View style={{ height: theme.spacing[2] }} />
            
            <PrimaryButton title="Small Button" onPress={() => {}} size="sm" />
            <PrimaryButton title="Large Button" onPress={() => {}} size="lg" />
            
            <View style={{ height: theme.spacing[2] }} />
            
            <PrimaryButton title="Loading..." onPress={() => {}} loading />
            <SecondaryButton title="Disabled" onPress={() => {}} disabled />
          </View>
        </Card>

        {/* Cards Section */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Cards
        </Text>

        <View style={{ gap: theme.spacing[3], marginBottom: theme.spacing[4] }}>
          <Card>
            <Text style={{ color: theme.text.primary }}>Default Card</Text>
          </Card>

          <ElevatedCard>
            <Text style={{ color: theme.text.primary }}>Elevated Card (with shadow)</Text>
          </ElevatedCard>

          <OutlinedCard>
            <Text style={{ color: theme.text.primary }}>Outlined Card</Text>
          </OutlinedCard>

          <Card padding="lg">
            <Text
              style={{
                fontSize: 18,
                fontWeight: '600',
                color: theme.text.primary,
                marginBottom: theme.spacing[2],
              }}
            >
              Card with Content
            </Text>
            <Text style={{ color: theme.text.secondary }}>
              This is a card with larger padding and multiple text elements.
            </Text>
          </Card>
        </View>

        {/* Inputs Section */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Inputs
        </Text>

        <Card padding="lg" style={{ marginBottom: theme.spacing[4] }}>
          <Input
            label="Text Input"
            value={textValue}
            onChangeText={setTextValue}
            placeholder="Enter text here..."
            helperText="This is helper text"
          />

          <View style={{ height: theme.spacing[4] }} />

          <Input
            label="Required Field"
            value=""
            onChangeText={() => {}}
            placeholder="Required"
            required
          />

          <View style={{ height: theme.spacing[4] }} />

          <Input
            label="With Error"
            value="invalid@"
            onChangeText={() => {}}
            error="Please enter a valid email address"
          />

          <View style={{ height: theme.spacing[4] }} />

          <Input
            label="Disabled"
            value="Can't edit this"
            onChangeText={() => {}}
            disabled
          />
        </Card>

        {/* Amount Input Section */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Amount Input
        </Text>

        <Card padding="lg" style={{ marginBottom: theme.spacing[4] }}>
          <AmountInput
            label="Transaction Amount"
            value={amount}
            onChangeValue={setAmount}
            helperText="Enter amount in dollars"
          />

          <View
            style={{
              marginTop: theme.spacing[4],
              padding: theme.spacing[3],
              backgroundColor: theme.background.secondary,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <Text style={{ color: theme.text.secondary, fontSize: 14 }}>
              Formatted: {formatCurrency(amount, '$', true)}
            </Text>
            <Text style={{ color: theme.text.tertiary, fontSize: 12, marginTop: 4 }}>
              Stored as: {amount} cents
            </Text>
          </View>
        </Card>

        {/* Financial Colors */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '600',
            color: theme.text.primary,
            marginBottom: theme.spacing[3],
          }}
        >
          Financial Colors
        </Text>

        <View style={{ gap: theme.spacing[3], marginBottom: theme.spacing[6] }}>
          <View
            style={{
              backgroundColor: theme.financial.incomeBackground,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.income,
            }}
          >
            <Text style={{ color: theme.financial.income, fontWeight: '600', fontSize: 18 }}>
              + $2,500.00
            </Text>
            <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
              Income - Salary
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.financial.expenseBackground,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.expense,
            }}
          >
            <Text style={{ color: theme.financial.expense, fontWeight: '600', fontSize: 18 }}>
              - $150.00
            </Text>
            <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
              Expense - Groceries
            </Text>
          </View>

          <View
            style={{
              backgroundColor: theme.financial.savingsBackground,
              padding: theme.spacing[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.savings,
            }}
          >
            <Text style={{ color: theme.financial.savings, fontWeight: '600', fontSize: 18 }}>
              $1,000.00
            </Text>
            <Text style={{ color: theme.text.secondary, marginTop: 4 }}>
              Savings - Emergency Fund
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

