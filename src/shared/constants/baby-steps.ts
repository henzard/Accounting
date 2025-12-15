// Dave Ramsey's 7 Baby Steps
// The foundation of the Dave Ramsey financial plan

export interface BabyStep {
  step: number;
  title: string;
  shortTitle: string;
  description: string;
  goalAmountUSD?: number; // Goal amount in USD (will be converted to household currency)
  icon: string;
}

export const BABY_STEPS: BabyStep[] = [
  {
    step: 1,
    title: 'Save $1,000 for Your Starter Emergency Fund',
    shortTitle: 'Starter Emergency Fund',
    description: 'Save $1,000 (or equivalent in your currency) as fast as you can! This starter emergency fund will cover small, unexpected expenses.',
    goalAmountUSD: 1000, // Dave Ramsey's recommendation: $1,000 USD
    icon: '🏦',
  },
  {
    step: 2,
    title: 'Pay Off All Debt (Except the House)',
    shortTitle: 'Debt Snowball',
    description: 'List all debts smallest to largest. Pay minimum on everything except the smallest. Attack that one with intensity!',
    icon: '⛄',
  },
  {
    step: 3,
    title: 'Save 3-6 Months of Expenses',
    shortTitle: 'Fully Funded Emergency Fund',
    description: 'Once debt-free, build a full emergency fund of 3-6 months of expenses. This is your financial security blanket.',
    icon: '🛡️',
  },
  {
    step: 4,
    title: 'Invest 15% of Income in Retirement',
    shortTitle: '15% Retirement',
    description: 'Invest 15% of your household income into tax-advantaged retirement accounts (401k, Roth IRA).',
    icon: '📈',
  },
  {
    step: 5,
    title: "Save for Children's College Fund",
    shortTitle: 'College Savings',
    description: 'If you have kids, start saving for their education using tax-advantaged accounts like 529 plans or ESAs.',
    icon: '🎓',
  },
  {
    step: 6,
    title: 'Pay Off Your Home Early',
    shortTitle: 'Pay Off Mortgage',
    description: 'Any extra money goes toward paying off your mortgage. Imagine life with no house payment!',
    icon: '🏠',
  },
  {
    step: 7,
    title: 'Build Wealth and Give Generously',
    shortTitle: 'Build Wealth & Give',
    description: 'With no payments in the world, build wealth and give like never before. Live and give like no one else!',
    icon: '💎',
  },
];

// Helper to get a specific baby step
export function getBabyStep(stepNumber: number): BabyStep | undefined {
  return BABY_STEPS.find((step) => step.step === stepNumber);
}

// Helper to get current step title
export function getBabyStepTitle(stepNumber: number): string {
  const step = getBabyStep(stepNumber);
  return step?.shortTitle || `Baby Step ${stepNumber}`;
}

// Validate that a step number is within the valid range (1-7)
export function isValidBabyStep(stepNumber: number): boolean {
  return Number.isInteger(stepNumber) && stepNumber >= 1 && stepNumber <= 7;
}

// Sanitize a potentially invalid step number to a valid one (defaults to 1)
export function sanitizeBabyStep(stepNumber: number | undefined | null): number {
  if (stepNumber === undefined || stepNumber === null) {
    return 1;
  }
  
  if (!isValidBabyStep(stepNumber)) {
    console.warn(`⚠️ Invalid baby step ${stepNumber}, defaulting to 1`);
    return 1;
  }
  
  return stepNumber;
}

