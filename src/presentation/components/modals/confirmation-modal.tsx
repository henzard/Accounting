// Confirmation Modal Component
// Reusable modal for confirmations, success messages, errors, and info
// Replaces Alert.alert with web-compatible, themed modal

import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppText } from '../styled';
import { PrimaryButton, OutlineButton } from '../Button';
import { useTheme } from '@/infrastructure/theme';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export type ConfirmationModalVariant = 'confirm' | 'success' | 'error' | 'info';

export interface ConfirmationModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Modal title */
  title: string;
  /** Modal message/description */
  message: string;
  /** Callback when user confirms */
  onConfirm: () => void;
  /** Callback when user cancels */
  onCancel: () => void;
  /** Confirm button text (default: "Confirm") */
  confirmText?: string;
  /** Cancel button text (default: "Cancel") */
  cancelText?: string;
  /** Loading state for confirm button */
  loading?: boolean;
  /** Variant type: confirm, success, error, info */
  variant?: ConfirmationModalVariant;
  /** Whether to show cancel button (default: true) */
  showCancel?: boolean;
}

/**
 * ConfirmationModal - Reusable confirmation dialog
 * 
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 * 
 * <ConfirmationModal
 *   visible={showModal}
 *   title="Delete Account?"
 *   message="This action cannot be undone."
 *   onConfirm={() => { setShowModal(false); handleDelete(); }}
 *   onCancel={() => setShowModal(false)}
 * />
 * ```
 */
export function ConfirmationModal({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  loading = false,
  variant = 'confirm',
  showCancel = true,
}: ConfirmationModalProps) {
  const { theme } = useTheme();

  // Get variant-specific styling
  const getVariantIcon = () => {
    switch (variant) {
      case 'success':
        return '🎉';
      case 'error':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'confirm':
      default:
        return '';
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'success':
        return theme.status.success;
      case 'error':
        return theme.status.error;
      case 'info':
        return theme.interactive.primary;
      case 'confirm':
      default:
        return theme.text.primary;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={[styles.modalCard, { backgroundColor: theme.background.elevated }]}>
              <AppText 
                variant="h2" 
                style={{ 
                  color: getVariantColor(), 
                  marginBottom: SPACING[2],
                  fontSize: 20,
                  fontWeight: '700',
                }}
              >
                {getVariantIcon() ? `${getVariantIcon()} ${title}` : title}
              </AppText>
              <AppText 
                variant="body" 
                style={{ 
                  color: theme.text.secondary, 
                  marginBottom: SPACING[6],
                  fontSize: 16,
                  lineHeight: 22,
                }}
              >
                {message}
              </AppText>
              <View style={styles.modalButtons}>
                {showCancel && (
                  <View style={{ flex: 1 }}>
                    <OutlineButton
                      title={cancelText}
                      onPress={onCancel}
                      disabled={loading}
                      fullWidth
                    />
                  </View>
                )}
                <View style={{ flex: 1 }}>
                  <PrimaryButton
                    title={confirmText}
                    onPress={onConfirm}
                    disabled={loading}
                    loading={loading}
                    fullWidth
                  />
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[6],
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING[6],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING[3],
  },
});
