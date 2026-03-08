// Add Business Screen - Create a new business/employer

import React, { useState } from 'react';
import { ScrollView, View, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert } from '@/shared/utils/alert';
import {
  ScreenHeader,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreBusinessRepository } from '@/data/repositories/FirestoreBusinessRepository';
import { Business, createBusiness } from '@/domain/entities';
import { SelectOption } from '@/shared/types';
import { v4 as uuidv4 } from 'uuid';

const BUSINESS_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Employer', value: 'EMPLOYER', subtitle: 'Company you work for' },
  { label: 'Client', value: 'CLIENT', subtitle: 'Freelance or consulting client' },
  { label: 'Own Business', value: 'OWN_BUSINESS', subtitle: 'Your own business/LLC' },
];

const REIMBURSEMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Reimbursable', value: 'REIMBURSABLE', subtitle: 'Will be reimbursed' },
  { label: 'Business Owned', value: 'BUSINESS_OWNED', subtitle: 'Tax deduction only' },
];

export default function AddBusinessScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [type, setType] = useState<'EMPLOYER' | 'CLIENT' | 'OWN_BUSINESS'>('EMPLOYER');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [defaultReimbursementType, setDefaultReimbursementType] = useState<'REIMBURSABLE' | 'BUSINESS_OWNED'>('REIMBURSABLE');
  const [saving, setSaving] = useState(false);

  const businessRepo = new FirestoreBusinessRepository();

  const validateForm = (): string | null => {
    if (!name.trim()) {
      return 'Please enter a business name';
    }
    if (contactEmail && !contactEmail.includes('@')) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  const handleSave = async () => {
    const error = validateForm();
    if (error) {
      showAlert('Validation Error', error);
      return;
    }

    if (!user?.default_household_id) {
      showAlert('Error', 'No household selected');
      return;
    }

    setSaving(true);
    try {
      const business = createBusiness({
        id: uuidv4(),
        household_id: user.default_household_id,
        name: name.trim(),
        type,
        created_by: user.id,
        contact_email: contactEmail.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        default_reimbursement_type: defaultReimbursementType,
      });

      await businessRepo.createBusiness(business);

      // Navigate back immediately after successful save
      router.back();
    } catch (error) {
      console.error('❌ Failed to save business:', error);
      showAlert('Error', 'Failed to save business');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title="Add Business" showBack />

        <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ padding: SPACING[4] }}>
            <Input
              label="Business Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g., ACME Corp, Client: XYZ, My Business LLC"
              autoCapitalize="words"
            />

            <SearchableSelect
              label="Type *"
              value={type}
              onSelect={(value) => setType(value as Business['type'])}
              options={BUSINESS_TYPE_OPTIONS}
              placeholder="Select business type"
            />

            <Input
              label="Contact Email (Optional)"
              value={contactEmail}
              onChangeText={setContactEmail}
              placeholder="expenses@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Contact Phone (Optional)"
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+1 (555) 123-4567"
              keyboardType="phone-pad"
            />

            <SearchableSelect
              label="Default Reimbursement Type *"
              value={defaultReimbursementType}
              onSelect={(value) => setDefaultReimbursementType(value as 'REIMBURSABLE' | 'BUSINESS_OWNED')}
              options={REIMBURSEMENT_TYPE_OPTIONS}
              placeholder="Select default type"
            />

            <Card padding="md" style={{ marginTop: SPACING[2], marginBottom: SPACING[4] }}>
              <AppText variant="caption" color={theme.text.secondary}>
                This default will be used when creating new expense transactions for this business.
              </AppText>
            </Card>

            <PrimaryButton
              title={saving ? 'Saving...' : 'Save Business'}
              onPress={handleSave}
              disabled={saving}
              loading={saving}
              fullWidth
              size="lg"
            />

            <OutlineButton
              title="Cancel"
              onPress={() => router.back()}
              disabled={saving}
              fullWidth
              size="lg"
              style={{ marginTop: SPACING[3] }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}
