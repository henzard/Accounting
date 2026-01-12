// Edit Business Screen - Edit an existing business/employer

import React, { useState, useEffect } from 'react';
import { ScrollView, View, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { Business } from '@/domain/entities';
import { SelectOption } from '@/shared/types';

const BUSINESS_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Employer', value: 'EMPLOYER', subtitle: 'Company you work for' },
  { label: 'Client', value: 'CLIENT', subtitle: 'Freelance or consulting client' },
  { label: 'Own Business', value: 'OWN_BUSINESS', subtitle: 'Your own business/LLC' },
];

const REIMBURSEMENT_TYPE_OPTIONS: SelectOption[] = [
  { label: 'Reimbursable', value: 'REIMBURSABLE', subtitle: 'Will be reimbursed' },
  { label: 'Business Owned', value: 'BUSINESS_OWNED', subtitle: 'Tax deduction only' },
];

export default function EditBusinessScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [business, setBusiness] = useState<Business | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<'EMPLOYER' | 'CLIENT' | 'OWN_BUSINESS'>('EMPLOYER');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [defaultReimbursementType, setDefaultReimbursementType] = useState<'REIMBURSABLE' | 'BUSINESS_OWNED'>('REIMBURSABLE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const businessRepo = new FirestoreBusinessRepository();

  useEffect(() => {
    const loadBusiness = async () => {
      if (!id) {
        showAlert('Error', 'No business ID provided');
        router.back();
        return;
      }

      try {
        setLoading(true);
        const loadedBusiness = await businessRepo.getBusinessById(id);
        
        if (!loadedBusiness) {
          showAlert('Error', 'Business not found');
          router.back();
          return;
        }

        setBusiness(loadedBusiness);
        setName(loadedBusiness.name);
        setType(loadedBusiness.type);
        setContactEmail(loadedBusiness.contact_email || '');
        setContactPhone(loadedBusiness.contact_phone || '');
        setDefaultReimbursementType(loadedBusiness.default_reimbursement_type);
      } catch (error) {
        console.error('❌ Failed to load business:', error);
        showAlert('Error', 'Failed to load business');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [id]);

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

    if (!business || !user?.default_household_id) {
      showAlert('Error', 'No business or household selected');
      return;
    }

    setSaving(true);
    try {
      await businessRepo.updateBusiness(business.id, {
        name: name.trim(),
        type,
        contact_email: contactEmail.trim() || undefined,
        contact_phone: contactPhone.trim() || undefined,
        default_reimbursement_type: defaultReimbursementType,
        updated_at: new Date(),
      });

      // Navigate back immediately after successful save
      router.back();
    } catch (error) {
      console.error('❌ Failed to update business:', error);
      showAlert('Error', 'Failed to update business');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Edit Business" showBack />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <AppText variant="body" color={theme.text.secondary}>
            Loading...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title="Edit Business" showBack />

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
              title={saving ? 'Saving...' : 'Save Changes'}
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
