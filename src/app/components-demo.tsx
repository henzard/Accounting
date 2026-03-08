// Components Demo Screen
// Shows all UI components in action with Homebase theme

import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
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
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { SPACING } from '@/shared/constants/spacing';

export default function ComponentsDemoScreen() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [textValue, setTextValue] = useState('');
  const [amount, setAmount] = useState(25000); // $250.00 in cents

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1 }}>
        {/* Header */}
        <AppText variant="display" style={{ marginBottom: SPACING[2] }}>
          UI Components
        </AppText>
        <AppText variant="body" color={theme.text.secondary} style={{ marginBottom: SPACING[6] }}>
          Homebase Budget design system showcase
        </AppText>

        {/* Theme Toggle */}
        <Card padding="md" style={{ marginBottom: SPACING[4] }}>
          <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
            Theme: {isDark ? 'Dark' : 'Light'} Mode
          </AppText>
          <Button title="Toggle Theme" onPress={toggleTheme} size="sm" />
        </Card>

        {/* Buttons Section */}
        <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
          Buttons
        </AppText>

        <Card padding="lg" style={{ marginBottom: SPACING[4] }}>
          <View style={{ gap: SPACING[3] }}>
            <PrimaryButton title="Primary Button" onPress={() => {}} />
            <SecondaryButton title="Secondary Button" onPress={() => {}} />
            <OutlineButton title="Outline Button" onPress={() => {}} />
            <GhostButton title="Ghost Button" onPress={() => {}} />
            
            <View style={{ height: SPACING[2] }} />
            
            <PrimaryButton title="Small Button" onPress={() => {}} size="sm" />
            <PrimaryButton title="Large Button" onPress={() => {}} size="lg" />
            
            <View style={{ height: SPACING[2] }} />
            
            <PrimaryButton title="Loading..." onPress={() => {}} loading />
            <SecondaryButton title="Disabled" onPress={() => {}} disabled />
          </View>
        </Card>

        {/* Cards Section */}
        <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
          Cards
        </AppText>

        <View style={{ gap: SPACING[3], marginBottom: SPACING[4] }}>
          <Card>
            <AppText variant="body">Default Card</AppText>
          </Card>

          <ElevatedCard>
            <AppText variant="body">Elevated Card (with shadow)</AppText>
          </ElevatedCard>

          <OutlinedCard>
            <AppText variant="body">Outlined Card</AppText>
          </OutlinedCard>

          <Card padding="lg">
            <AppText variant="h2" style={{ marginBottom: SPACING[2] }}>
              Card with Content
            </AppText>
            <AppText variant="body" color={theme.text.secondary}>
              This is a card with larger padding and multiple text elements.
            </AppText>
          </Card>
        </View>

        {/* Inputs Section */}
        <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
          Inputs
        </AppText>

        <Card padding="lg" style={{ marginBottom: SPACING[4] }}>
          <Input
            label="Text Input"
            value={textValue}
            onChangeText={setTextValue}
            placeholder="Enter text here..."
            helperText="This is helper text"
          />

          <View style={{ height: SPACING[4] }} />

          <Input
            label="Required Field"
            value=""
            onChangeText={() => {}}
            placeholder="Required"
            required
          />

          <View style={{ height: SPACING[4] }} />

          <Input
            label="With Error"
            value="invalid@"
            onChangeText={() => {}}
            error="Please enter a valid email address"
          />

          <View style={{ height: SPACING[4] }} />

          <Input
            label="Disabled"
            value="Can't edit this"
            onChangeText={() => {}}
            disabled
          />
        </Card>

        {/* Amount Input Section */}
        <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
          Amount Input
        </AppText>

        <Card padding="lg" style={{ marginBottom: SPACING[4] }}>
          <AmountInput
            label="Transaction Amount"
            value={amount}
            onChangeValue={setAmount}
            helperText="Enter amount in dollars"
          />

          <View
            style={{
              marginTop: SPACING[4],
              padding: SPACING[3],
              backgroundColor: theme.background.secondary,
              borderRadius: theme.borderRadius.md,
            }}
          >
            <AppText variant="body" color={theme.text.secondary}>
              Formatted: {formatCurrency(amount, '$', true)}
            </AppText>
            <AppText variant="caption" color={theme.text.tertiary} style={{ marginTop: SPACING[1] }}>
              Stored as: {amount} cents
            </AppText>
          </View>
        </Card>

        {/* Financial Colors */}
        <AppText variant="h2" style={{ marginBottom: SPACING[3] }}>
          Financial Colors
        </AppText>

        <View style={{ gap: SPACING[3], marginBottom: SPACING[6] }}>
          <View
            style={{
              backgroundColor: theme.financial.incomeBackground,
              padding: SPACING[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.income,
            }}
          >
            <AppText variant="h2" color={theme.financial.income}>
              + $2,500.00
            </AppText>
            <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[1] }}>
              Income - Salary
            </AppText>
          </View>

          <View
            style={{
              backgroundColor: theme.financial.expenseBackground,
              padding: SPACING[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.expense,
            }}
          >
            <AppText variant="h2" color={theme.financial.expense}>
              - $150.00
            </AppText>
            <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[1] }}>
              Expense - Groceries
            </AppText>
          </View>

          <View
            style={{
              backgroundColor: theme.financial.savingsBackground,
              padding: SPACING[4],
              borderRadius: theme.borderRadius.md,
              borderLeftWidth: 4,
              borderLeftColor: theme.financial.savings,
            }}
          >
            <AppText variant="h2" color={theme.financial.savings}>
              $1,000.00
            </AppText>
            <AppText variant="body" color={theme.text.secondary} style={{ marginTop: SPACING[1] }}>
              Savings - Emergency Fund
            </AppText>
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

