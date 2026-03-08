// BabyStepsDisplay Component - Homebase Budget
// Shows current Baby Step with progress indicator

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/infrastructure/theme';
import { BABY_STEPS, getBabyStep } from '@/shared/constants/baby-steps';
import { formatCurrency, CurrencyCode, convertFromUSD } from '@/shared/utils/currency';
import { Card } from './Card';

interface BabyStepsDisplayProps {
  currentStep: number;
  currency?: CurrencyCode;
  onPress?: () => void;
  testID?: string;
}

export const BabyStepsDisplay: React.FC<BabyStepsDisplayProps> = ({
  currentStep,
  currency = 'USD',
  onPress,
  testID,
}) => {
  const { theme } = useTheme();
  const step = getBabyStep(currentStep);

  if (!step) {
    return null;
  }

  const content = (
    <Card testID={testID}>
      {/* Header with Step Number and Title */}
      <View style={styles.header}>
        <View
          style={[
            styles.stepBadge,
            { backgroundColor: theme.interactive.primary },
          ]}
        >
          <Text style={[styles.stepNumber, { color: theme.text.inverse }]}>
            {step.step}
          </Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.stepLabel, { color: theme.text.secondary }]}>
            Baby Step {step.step} of 7
          </Text>
          <Text style={[styles.stepTitle, { color: theme.text.primary }]}>
            {step.shortTitle}
          </Text>
        </View>
        <Text style={styles.icon}>{step.icon}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: theme.background.tertiary },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: theme.status.success,
                width: `${((currentStep - 1) / 6) * 100}%`,
              },
            ]}
          />
          <View
            style={[
              styles.progressCurrent,
              {
                backgroundColor: theme.interactive.primary,
                left: `${((currentStep - 1) / 6) * 100}%`,
              },
            ]}
          />
        </View>

        {/* Step Dots */}
        <View style={styles.dotsContainer}>
          {BABY_STEPS.map((s) => (
            <View
              key={s.step}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    s.step < currentStep
                      ? theme.status.success
                      : s.step === currentStep
                      ? theme.interactive.primary
                      : theme.background.tertiary,
                  borderColor:
                    s.step === currentStep
                      ? theme.interactive.primary
                      : 'transparent',
                  borderWidth: s.step === currentStep ? 2 : 0,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: theme.text.secondary }]}>
        {step.description}
      </Text>

      {/* Goal if available */}
      {step.goalAmountUSD && (
        <View
          style={[
            styles.goalContainer,
            { backgroundColor: theme.status.successBackground },
          ]}
        >
          <Text style={[styles.goalLabel, { color: theme.status.success }]}>
            Goal: {formatCurrency(convertFromUSD(step.goalAmountUSD, currency), currency)}
          </Text>
        </View>
      )}

      {/* Tap hint */}
      {onPress && (
        <Text style={[styles.tapHint, { color: theme.text.tertiary }]}>
          Tap to change step →
        </Text>
      )}
    </Card>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  icon: {
    fontSize: 32,
    marginLeft: 8,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'visible',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressCurrent: {
    position: 'absolute',
    top: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: -8,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  goalContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tapHint: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
});

