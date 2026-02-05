// Add Debt Screen - Homebase Budget
// Form to add a new debt for Debt Snowball tracking

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import { ScreenHeader, Card, AmountInput, PrimaryButton, Input, SearchableSelect, ScreenWrapper, AppText } from '@/presentation/components';
import { DebtType, createDebt } from '@/domain/entities';
import { FirestoreDebtRepository } from '@/data/repositories/FirestoreDebtRepository';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { v4 as uuidv4 } from 'uuid';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

const DEBT_TYPE_OPTIONS = [
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'PERSONAL_LOAN', label: 'Personal Loan' },
  { value: 'STUDENT_LOAN', label: 'Student Loan' },
  { value: 'CAR_LOAN', label: 'Car Loan' },
  { value: 'MEDICAL', label: 'Medical' },
  { value: 'MORTGAGE', label: 'Mortgage' },
  { value: 'OTHER', label: 'Other' },
];

export default function AddDebtScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  
  const [name, setName] = useState('');
  const [type, setType] = useState<DebtType>('CREDIT_CARD');
  const [currentBalance, setCurrentBalance] = useState(0); // in cents
  const [minimumPayment, setMinimumPayment] = useState(0); // in cents
  const [interestRate, setInterestRate] = useState('0');
  const [isMortgage, setIsMortgage] = useState(false);

  const debtRepository = new FirestoreDebtRepository();

  React.useEffect(() => {
    const loadCurrency = async () => {
      if (!user?.default_household_id) return;

      try {
        const householdDoc = await getDoc(
          doc(db, 'households', user.default_household_id)
        );

        if (householdDoc.exists()) {
          const data = householdDoc.data();
          setHouseholdCurrency((data.currency as CurrencyCode) || 'USD');
        }
      } catch (error) {
        console.error('Error loading household currency:', error);
      }
    };

    loadCurrency();
  }, [user?.default_household_id]);

  // Auto-set is_mortgage when type is MORTGAGE
  React.useEffect(() => {
    if (type === 'MORTGAGE') {
      setIsMortgage(true);
    }
  }, [type]);

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      showAlert('Validation Error', 'Please enter a debt name');
      return;
    }

    if (currentBalance <= 0) {
      showAlert('Validation Error', 'Current balance must be greater than 0');
      return;
    }

    if (minimumPayment <= 0) {
      showAlert('Validation Error', 'Minimum payment must be greater than 0');
      return;
    }

    const interestRateNum = parseFloat(interestRate);
    if (isNaN(interestRateNum) || interestRateNum < 0 || interestRateNum > 100) {
      showAlert('Validation Error', 'Interest rate must be between 0 and 100');
      return;
    }

    if (!user?.default_household_id) {
      showAlert('Error', 'No household selected');
      return;
    }

    setSaving(true);

    try {
      const debtId = uuidv4();
      const newDebt = createDebt({
        id: debtId,
        household_id: user.default_household_id,
        name: name.trim(),
        type,
        current_balance: currentBalance,
        minimum_payment: minimumPayment,
        interest_rate: interestRateNum,
        created_by: user.id,
        is_mortgage: isMortgage || type === 'MORTGAGE',
      });

      await debtRepository.createDebt(newDebt);
      
      // Recalculate snowball order
      await debtRepository.recalculateSnowballOrder(user.default_household_id);

      showAlert('Success', 'Debt added successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Error saving debt:', error);
      showAlert('Error', 'Failed to save debt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScreenHeader title="Add Debt" showBack={true} />

      <ScrollView style={styles.scrollView}>
        <Card style={styles.formCard}>
          <AppText variant="h2" style={{ color: theme.text.primary, marginBottom: SPACING[5] }}>
            Debt Information
          </AppText>

          {/* Debt Name */}
          <View style={styles.field}>
            <Input
              label="Debt Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g., Chase Visa, Student Loan"
            />
          </View>

          {/* Debt Type */}
          <View style={styles.field}>
            <SearchableSelect
              label="Debt Type *"
              options={DEBT_TYPE_OPTIONS}
              value={type}
              onSelect={(value) => setType(value as DebtType)}
              placeholder="Select debt type"
            />
          </View>

          {/* Current Balance */}
          <View style={styles.field}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary, marginBottom: SPACING[2] }}>
              Current Balance *
            </AppText>
            <AmountInput
              value={currentBalance}
              onChangeValue={setCurrentBalance}
              currency={householdCurrency}
            />
            <AppText variant="caption" style={{ color: theme.text.tertiary, marginTop: SPACING[1] }}>
              How much you currently owe
            </AppText>
          </View>

          {/* Minimum Payment */}
          <View style={styles.field}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary, marginBottom: SPACING[2] }}>
              Minimum Payment *
            </AppText>
            <AmountInput
              value={minimumPayment}
              onChangeValue={setMinimumPayment}
              currency={householdCurrency}
            />
            <AppText variant="caption" style={{ color: theme.text.tertiary, marginTop: SPACING[1] }}>
              Monthly minimum payment required
            </AppText>
          </View>

          {/* Interest Rate */}
          <View style={styles.field}>
            <Input
              label="Interest Rate (%)"
              value={interestRate}
              onChangeText={setInterestRate}
              placeholder="0.00"
              keyboardType="decimal-pad"
              helperText="Annual interest rate (e.g., 5.5 for 5.5%)"
            />
          </View>

          {/* Is Mortgage Toggle (only show if not already a mortgage type) */}
          {type !== 'MORTGAGE' && (
            <View style={styles.field}>
              <View style={styles.checkboxRow}>
                <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
                  This is a mortgage (Baby Step 6)
                </AppText>
                <TouchableOpacity
                  onPress={() => setIsMortgage(!isMortgage)}
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: isMortgage ? theme.interactive.primary : theme.background.secondary,
                      borderColor: theme.border.default,
                    },
                  ]}
                >
                  {isMortgage && (
                    <AppText variant="body" style={{ color: theme.text.inverse }}>✓</AppText>
                  )}
                </TouchableOpacity>
              </View>
              <AppText variant="caption" style={{ color: theme.text.tertiary, marginTop: SPACING[1] }}>
                Mortgages are excluded from Baby Step 2 (Debt Snowball)
              </AppText>
            </View>
          )}

          {type === 'MORTGAGE' && (
            <View style={[styles.infoBox, { backgroundColor: theme.status.infoBackground }]}>
              <AppText variant="caption" style={{ color: theme.status.info }}>
                ℹ️ Mortgages are tracked separately for Baby Step 6 (Pay off home early)
              </AppText>
            </View>
          )}
        </Card>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <PrimaryButton
            title="Add Debt"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
          />
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  formCard: {
    margin: SPACING[4],
  },
  field: {
    marginBottom: SPACING[5],
  },
  checkboxRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING[2],
  },
  buttonContainer: {
    padding: SPACING[4],
    paddingBottom: SPACING[8],
  },
});
