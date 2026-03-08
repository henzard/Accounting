// Add Transaction Screen
// Form to create new income or expense transaction

import React, { useCallback } from 'react';
import {
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import {
  ScreenHeader,
  AmountInput,
  Input,
  SearchableSelect,
  Card,
  PrimaryButton,
  OutlineButton,
  ScreenWrapper,
  AppText,
} from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { useTransactionForm } from './hooks/useTransactionForm';

export default function AddTransactionScreen() {
  const { theme } = useTheme();
  const router = useRouter();

  const {
    type, setType,
    amountInCents, setAmountInCents,
    selectedAccountId, setSelectedAccountId,
    selectedCategoryGroup, setSelectedCategoryGroup,
    selectedCategoryId, setSelectedCategoryId,
    payee, setPayee,
    notes, setNotes,
    isBusiness, handleToggleBusiness,
    selectedBusinessId, handleSelectBusiness,
    reimbursementType, setReimbursementType,
    receiptImages, uploadingReceipts,
    handleAddReceipt, handleTakeReceiptPhoto, handleRemoveReceipt,
    loading, saving,
    householdCurrency,
    accountOptions, categoryGroupOptions, categoryOptions,
    businesses, businessOptions, reimbursementTypeOptions,
    handleSave,
  } = useTransactionForm();

  const handleCancel = useCallback(() => router.back(), [router]);

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Add Transaction" showBack />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScreenHeader title="Add Transaction" showBack />

        <ScrollView style={styles.flex} keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Transaction Type Toggle */}
            <Card padding="md" style={styles.cardSpacing}>
              <AppText variant="body" style={[styles.fieldLabel, { color: theme.text.secondary }]}>
                Transaction Type
              </AppText>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  onPress={() => setType('EXPENSE')}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'EXPENSE' ? theme.financial.expense : theme.background.secondary,
                      borderColor: type === 'EXPENSE' ? theme.financial.expense : theme.border.default,
                    },
                  ]}
                >
                  <AppText
                    variant="button"
                    style={[
                      styles.typeButtonText,
                      { color: type === 'EXPENSE' ? theme.text.inverse : theme.text.primary },
                    ]}
                  >
                    Expense
                  </AppText>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setType('INCOME')}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === 'INCOME' ? theme.financial.income : theme.background.secondary,
                      borderColor: type === 'INCOME' ? theme.financial.income : theme.border.default,
                    },
                  ]}
                >
                  <AppText
                    variant="button"
                    style={[
                      styles.typeButtonText,
                      { color: type === 'INCOME' ? theme.text.inverse : theme.text.primary },
                    ]}
                  >
                    Income
                  </AppText>
                </TouchableOpacity>
              </View>
            </Card>

            {/* Amount */}
            <AmountInput
              label="Amount *"
              value={amountInCents}
              onChangeValue={setAmountInCents}
              currency={householdCurrency}
              placeholder="0.00"
            />

            {/* Payee */}
            <Input
              label="Payee *"
              value={payee}
              onChangeText={setPayee}
              placeholder="Who did you pay or receive from?"
              autoCapitalize="words"
            />

            {/* Account */}
            <SearchableSelect
              label="Account *"
              value={selectedAccountId}
              onSelect={setSelectedAccountId}
              options={accountOptions}
              placeholder="Select account"
            />

            {/* Category */}
            {categoryGroupOptions.length === 0 ? (
              <Card padding="md" style={styles.cardSpacing}>
                <AppText variant="body" style={[styles.fieldLabel, { color: theme.text.secondary }]}>
                  Category *
                </AppText>
                <TouchableOpacity
                  onPress={() => router.push('/budget/manage-categories')}
                  style={[
                    styles.emptyCategory,
                    {
                      borderColor: theme.border.default,
                      backgroundColor: theme.status.warningBackground,
                    },
                  ]}
                >
                  <AppText variant="body" style={[styles.textCenter, { color: theme.status.warning, marginBottom: SPACING[1] }]}>
                    ⚠️ No budget categories found
                  </AppText>
                  <AppText variant="caption" style={[styles.textCenter, { color: theme.status.warning }]}>
                    Tap to add categories in Budget settings
                  </AppText>
                </TouchableOpacity>
              </Card>
            ) : (
              <>
                <SearchableSelect
                  label="Category Group *"
                  value={selectedCategoryGroup}
                  onSelect={setSelectedCategoryGroup}
                  options={categoryGroupOptions}
                  placeholder="Select category group"
                />

                {selectedCategoryGroup && (
                  <SearchableSelect
                    label="Category *"
                    value={selectedCategoryId}
                    onSelect={setSelectedCategoryId}
                    options={categoryOptions}
                    placeholder="Select specific category"
                  />
                )}
              </>
            )}

            {/* Notes */}
            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this transaction"
              multiline
              numberOfLines={3}
            />

            {/* Business Expense Section */}
            {type === 'EXPENSE' && (
              <Card padding="md" style={styles.cardSpacing}>
                <AppText variant="body" style={[styles.fieldLabel, { color: theme.text.secondary }]}>
                  Business Expense
                </AppText>

                <TouchableOpacity
                  onPress={handleToggleBusiness}
                  style={[styles.toggleRow, { marginBottom: isBusiness ? SPACING[3] : 0 }]}
                >
                  <AppText variant="body">This is a business expense</AppText>
                  <View style={[styles.toggle, { backgroundColor: isBusiness ? theme.interactive.primary : theme.border.default }]}>
                    <View style={[styles.toggleThumb, {
                      backgroundColor: theme.surface.default,
                      transform: [{ translateX: isBusiness ? 20 : 0 }],
                    }]} />
                  </View>
                </TouchableOpacity>

                {isBusiness && (
                  <>
                    {businesses.length > 0 ? (
                      <SearchableSelect
                        label="Business/Employer *"
                        value={selectedBusinessId}
                        onSelect={handleSelectBusiness}
                        options={businessOptions}
                        placeholder="Select business or employer"
                        style={{ marginBottom: SPACING[3] }}
                      />
                    ) : (
                      <TouchableOpacity
                        onPress={() => router.push('/businesses/add')}
                        style={[styles.addBusinessButton, { borderColor: theme.border.default }]}
                      >
                        <AppText variant="body" style={{ color: theme.interactive.primary, textAlign: 'center' }}>
                          + Add Business/Employer
                        </AppText>
                      </TouchableOpacity>
                    )}

                    {selectedBusinessId && (
                      <SearchableSelect
                        label="Reimbursement Type *"
                        value={reimbursementType ?? ''}
                        onSelect={(value) => setReimbursementType(value as 'REIMBURSABLE' | 'BUSINESS_OWNED')}
                        options={reimbursementTypeOptions}
                        placeholder="Select reimbursement type"
                      />
                    )}
                  </>
                )}
              </Card>
            )}

            {/* Date Display */}
            <Card padding="md" style={styles.cardSpacing}>
              <AppText variant="body" style={[styles.fieldLabel, { color: theme.text.secondary }]}>
                Date
              </AppText>
              <AppText variant="body">
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </AppText>
            </Card>

            {/* Receipt Photos */}
            <Card padding="md" style={styles.cardSpacing}>
              <AppText variant="body" style={[styles.fieldLabel, { color: theme.text.secondary }]}>
                Receipt Photos ({receiptImages.length})
              </AppText>

              {receiptImages.length > 0 && (
                <View style={styles.receiptGrid}>
                  {receiptImages.map((image, index) => (
                    <View key={index} style={styles.receiptItem}>
                      <Image
                        source={{ uri: image.uri }}
                        style={[styles.receiptImage, { backgroundColor: theme.background.secondary }]}
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => handleRemoveReceipt(index)}
                        style={[styles.receiptRemove, { backgroundColor: theme.status.error }]}
                      >
                        <IconSymbol name="xmark" size={14} color={theme.text.inverse} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.receiptButtons}>
                <OutlineButton
                  title="📷 Take Photo"
                  onPress={handleTakeReceiptPhoto}
                  size="sm"
                  style={styles.receiptButtonItem}
                />
                <OutlineButton
                  title="📁 Choose from Gallery"
                  onPress={handleAddReceipt}
                  size="sm"
                  style={styles.receiptButtonItem}
                />
              </View>
            </Card>

            {/* Save Button */}
            <PrimaryButton
              title={
                uploadingReceipts
                  ? 'Uploading Receipts...'
                  : saving
                  ? 'Saving...'
                  : 'Save Transaction'
              }
              onPress={handleSave}
              disabled={saving || uploadingReceipts}
              loading={saving || uploadingReceipts}
              fullWidth
              size="lg"
            />

            <OutlineButton
              title="Cancel"
              onPress={handleCancel}
              disabled={saving}
              fullWidth
              size="lg"
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING[4],
  },
  cardSpacing: {
    marginBottom: SPACING[4],
  },
  fieldLabel: {
    marginBottom: SPACING[2],
  },
  typeRow: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  typeButton: {
    flex: 1,
    paddingVertical: SPACING[3],
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 2,
  },
  typeButtonText: {
    textAlign: 'center',
  },
  emptyCategory: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  textCenter: {
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING[2],
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  addBusinessButton: {
    padding: SPACING[3],
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: SPACING[3],
  },
  receiptGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: SPACING[3],
  },
  receiptItem: {
    position: 'relative',
    width: 100,
    height: 100,
    marginRight: SPACING[2],
    marginBottom: SPACING[2],
  },
  receiptImage: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.sm,
  },
  receiptRemove: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  receiptButtons: {
    flexDirection: 'row',
    gap: SPACING[2],
  },
  receiptButtonItem: {
    flex: 1,
  },
  cancelButton: {
    marginTop: SPACING[3],
  },
});
