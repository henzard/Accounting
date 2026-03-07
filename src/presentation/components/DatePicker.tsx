// DatePicker Component
// Cross-platform date picker with Android/iOS native pickers
// For web: uses HTML5 date input

import React, { useState } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { AppText } from './styled';
import { useTheme } from '@/infrastructure/theme';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { formatDate } from '@/shared/utils/date';

export interface DatePickerProps {
  /** Label for the date picker */
  label: string;
  /** Selected date value */
  value: Date | undefined;
  /** Callback when date changes */
  onChange: (date: Date | undefined) => void;
  /** Minimum selectable date */
  minimumDate?: Date;
  /** Maximum selectable date */
  maximumDate?: Date;
  /** Optional helper text */
  helperText?: string;
  /** Optional error message */
  error?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * DatePicker - Cross-platform date picker component
 * 
 * @example
 * ```tsx
 * const [date, setDate] = useState<Date | undefined>(undefined);
 * 
 * <DatePicker
 *   label="Target Date"
 *   value={date}
 *   onChange={setDate}
 *   minimumDate={new Date()}
 * />
 * ```
 */
export function DatePicker({
  label,
  value,
  onChange,
  minimumDate,
  maximumDate,
  helperText,
  error,
  testID,
}: DatePickerProps) {
  const { theme } = useTheme();
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (event.type === 'set' && selectedDate) {
      onChange(selectedDate);
    } else if (event.type === 'dismissed') {
      // User cancelled - don't change the date
      setShow(false);
    }
  };

  const handlePress = () => {
    setShow(true);
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <View style={styles.container}>
      {/* Label */}
      <AppText 
        variant="inputLabel" 
        style={{ 
          color: theme.text.primary, 
          marginBottom: SPACING[2],
        }}
      >
        {label}
      </AppText>

      {/* Date Display / Trigger */}
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.dateButton,
          {
            backgroundColor: theme.background.secondary,
            borderColor: error ? theme.status.error : theme.border.default,
          },
        ]}
        testID={testID}
      >
        <AppText
          variant="body"
          style={{
            color: value ? theme.text.primary : theme.text.tertiary,
          }}
        >
          {value ? formatDate(value) : 'Select date...'}
        </AppText>

        {value && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <AppText variant="body" style={{ color: theme.text.secondary }}>
              ✕
            </AppText>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Helper Text or Error */}
      {(helperText || error) && (
        <AppText
          variant="helper"
          style={{
            color: error ? theme.status.error : theme.text.secondary,
            marginTop: SPACING[1],
          }}
        >
          {error || helperText}
        </AppText>
      )}

      {/* Native Date Picker */}
      {show && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          testID={`${testID}-picker`}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING[4],
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: SPACING[4],
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  clearButton: {
    padding: SPACING[2],
  },
});
