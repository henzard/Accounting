// Tests for Baby Steps utilities
// Ensures robust validation and sanitization

import { 
  BABY_STEPS, 
  getBabyStep, 
  getBabyStepTitle, 
  isValidBabyStep, 
  sanitizeBabyStep 
} from '../baby-steps';

describe('BABY_STEPS', () => {
  it('should have exactly 7 steps', () => {
    expect(BABY_STEPS).toHaveLength(7);
  });

  it('should have sequential step numbers 1-7', () => {
    BABY_STEPS.forEach((step, index) => {
      expect(step.step).toBe(index + 1);
    });
  });

  it('should have required fields for each step', () => {
    BABY_STEPS.forEach((step) => {
      expect(step.step).toBeDefined();
      expect(step.title).toBeDefined();
      expect(step.shortTitle).toBeDefined();
      expect(step.description).toBeDefined();
      expect(step.icon).toBeDefined();
    });
  });
});

describe('getBabyStep', () => {
  it('should return the correct step for valid numbers', () => {
    const step3 = getBabyStep(3);
    expect(step3?.step).toBe(3);
    expect(step3?.shortTitle).toBe('Fully Funded Emergency Fund');
  });

  it('should return undefined for invalid step numbers', () => {
    expect(getBabyStep(0)).toBeUndefined();
    expect(getBabyStep(8)).toBeUndefined();
    expect(getBabyStep(-1)).toBeUndefined();
    expect(getBabyStep(100)).toBeUndefined();
  });
});

describe('getBabyStepTitle', () => {
  it('should return the short title for valid steps', () => {
    expect(getBabyStepTitle(1)).toBe('Starter Emergency Fund');
    expect(getBabyStepTitle(7)).toBe('Build Wealth & Give');
  });

  it('should return fallback for invalid steps', () => {
    expect(getBabyStepTitle(0)).toBe('Baby Step 0');
    expect(getBabyStepTitle(8)).toBe('Baby Step 8');
  });
});

describe('isValidBabyStep', () => {
  it('should return true for valid steps (1-7)', () => {
    expect(isValidBabyStep(1)).toBe(true);
    expect(isValidBabyStep(2)).toBe(true);
    expect(isValidBabyStep(3)).toBe(true);
    expect(isValidBabyStep(4)).toBe(true);
    expect(isValidBabyStep(5)).toBe(true);
    expect(isValidBabyStep(6)).toBe(true);
    expect(isValidBabyStep(7)).toBe(true);
  });

  it('should return false for out-of-range steps', () => {
    expect(isValidBabyStep(0)).toBe(false);
    expect(isValidBabyStep(8)).toBe(false);
    expect(isValidBabyStep(-1)).toBe(false);
    expect(isValidBabyStep(100)).toBe(false);
  });

  it('should return false for non-integers', () => {
    expect(isValidBabyStep(1.5)).toBe(false);
    expect(isValidBabyStep(3.14)).toBe(false);
  });

  it('should return false for NaN and Infinity', () => {
    expect(isValidBabyStep(NaN)).toBe(false);
    expect(isValidBabyStep(Infinity)).toBe(false);
    expect(isValidBabyStep(-Infinity)).toBe(false);
  });
});

describe('sanitizeBabyStep', () => {
  describe('valid inputs', () => {
    it('should return the same value for valid numbers', () => {
      expect(sanitizeBabyStep(1)).toBe(1);
      expect(sanitizeBabyStep(5)).toBe(5);
      expect(sanitizeBabyStep(7)).toBe(7);
    });

    it('should handle valid string numbers', () => {
      expect(sanitizeBabyStep('1')).toBe(1);
      expect(sanitizeBabyStep('5')).toBe(5);
      expect(sanitizeBabyStep('7')).toBe(7);
    });
  });

  describe('null and undefined', () => {
    it('should default to 1 for null', () => {
      expect(sanitizeBabyStep(null)).toBe(1);
    });

    it('should default to 1 for undefined', () => {
      expect(sanitizeBabyStep(undefined)).toBe(1);
    });
  });

  describe('out-of-range values', () => {
    it('should default to 1 for zero', () => {
      expect(sanitizeBabyStep(0)).toBe(1);
    });

    it('should default to 1 for negative numbers', () => {
      expect(sanitizeBabyStep(-1)).toBe(1);
      expect(sanitizeBabyStep(-100)).toBe(1);
    });

    it('should default to 1 for numbers > 7', () => {
      expect(sanitizeBabyStep(8)).toBe(1);
      expect(sanitizeBabyStep(100)).toBe(1);
    });

    it('should default to 1 for out-of-range strings', () => {
      expect(sanitizeBabyStep('0')).toBe(1);
      expect(sanitizeBabyStep('8')).toBe(1);
      expect(sanitizeBabyStep('-5')).toBe(1);
    });
  });

  describe('invalid types', () => {
    it('should default to 1 for non-numeric strings', () => {
      expect(sanitizeBabyStep('abc')).toBe(1);
      expect(sanitizeBabyStep('hello')).toBe(1);
      expect(sanitizeBabyStep('')).toBe(1);
    });

    it('should default to 1 for NaN', () => {
      expect(sanitizeBabyStep(NaN)).toBe(1);
    });

    it('should default to 1 for Infinity', () => {
      expect(sanitizeBabyStep(Infinity)).toBe(1);
      expect(sanitizeBabyStep(-Infinity)).toBe(1);
    });

    it('should default to 1 for decimal numbers', () => {
      expect(sanitizeBabyStep(1.5)).toBe(1);
      expect(sanitizeBabyStep(3.99)).toBe(1);
    });

    it('should default to 1 for decimal strings', () => {
      expect(sanitizeBabyStep('3.5')).toBe(1);
      expect(sanitizeBabyStep('5.99')).toBe(1);
    });
  });

  describe('edge cases from Firebase', () => {
    it('should handle numeric strings from Firebase', () => {
      // Firestore might return "5" instead of 5
      expect(sanitizeBabyStep('5')).toBe(5);
    });

    it('should handle string with whitespace', () => {
      expect(sanitizeBabyStep(' 3 ')).toBe(3);
      expect(sanitizeBabyStep('  5  ')).toBe(5);
    });

    it('should handle string with leading zeros', () => {
      expect(sanitizeBabyStep('05')).toBe(5);
      expect(sanitizeBabyStep('003')).toBe(3);
    });
  });
});

