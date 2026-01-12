// Alert utility - Web-compatible alerts
// Alert.alert doesn't work on web, so we use window.alert/window.confirm

import { Alert, Platform } from 'react-native';

export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Show an alert dialog that works on both web and native
 * On web: Uses window.alert (simple, no buttons)
 * On native: Uses Alert.alert (full button support)
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    // On web, use window.alert (simple, no button customization)
    // If there's a cancel button, we can't show it, so just show the alert
    const fullMessage = message ? `${title}\n\n${message}` : title;
    window.alert(fullMessage);
    
    // If there's a button with onPress, call it after alert
    if (buttons && buttons.length > 0) {
      const primaryButton = buttons.find(b => b.style !== 'cancel') || buttons[0];
      if (primaryButton?.onPress) {
        // Small delay to ensure alert is shown first
        setTimeout(() => {
          primaryButton.onPress?.();
        }, 100);
      }
    }
  } else {
    // Native: Use Alert.alert with full button support
    if (buttons && buttons.length > 0) {
      Alert.alert(title, message, buttons);
    } else {
      Alert.alert(title, message);
    }
  }
}

/**
 * Show a confirmation dialog that works on both web and native
 * On web: Uses window.confirm
 * On native: Uses Alert.alert with buttons
 */
export function showConfirm(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
): void {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(
      title,
      message,
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: onCancel,
        },
        {
          text: 'Confirm',
          onPress: onConfirm,
        },
      ]
    );
  }
}
