// Dave Ramsey's Recommended Budget Categories
// Based on EveryDollar app and Financial Peace University

import { CategoryGroup } from '@/domain/entities/Budget';

export interface MasterCategory {
  id: string;
  name: string;
  group: CategoryGroup;
  icon: string;
  sort_order: number;
  is_default: boolean; // Created automatically for new budgets
  household_id?: string; // For custom categories (null for defaults)
  description?: string;
}

// Dave Ramsey's recommended budget categories
export const DEFAULT_BUDGET_CATEGORIES: MasterCategory[] = [
  // ============================================
  // GIVING (Baby Step 2+)
  // ============================================
  {
    id: 'giving-tithe',
    name: 'Tithe',
    group: 'GIVING',
    icon: '⛪',
    sort_order: 1,
    is_default: true,
    description: '10% of income to church/place of worship',
  },
  {
    id: 'giving-charity',
    name: 'Charity',
    group: 'GIVING',
    icon: '❤️',
    sort_order: 2,
    is_default: true,
    description: 'Additional giving to charities',
  },

  // ============================================
  // SAVING (Baby Steps 1, 3)
  // ============================================
  {
    id: 'saving-emergency',
    name: 'Emergency Fund',
    group: 'SAVING',
    icon: '🛡️',
    sort_order: 3,
    is_default: true,
    description: '$1,000 starter or 3-6 months expenses',
  },
  {
    id: 'saving-sinking-funds',
    name: 'Sinking Funds',
    group: 'SAVING',
    icon: '🏦',
    sort_order: 4,
    is_default: true,
    description: 'Christmas, vacation, car repairs',
  },

  // ============================================
  // HOUSING (25-35% of income max)
  // ============================================
  {
    id: 'housing-mortgage-rent',
    name: 'Mortgage/Rent',
    group: 'HOUSING',
    icon: '🏠',
    sort_order: 10,
    is_default: true,
    description: 'Monthly payment (25-35% of take-home max)',
  },
  {
    id: 'housing-utilities',
    name: 'Utilities',
    group: 'HOUSING',
    icon: '💡',
    sort_order: 11,
    is_default: true,
    description: 'Electric, water, gas, trash',
  },
  {
    id: 'housing-internet-cable',
    name: 'Internet & Cable',
    group: 'HOUSING',
    icon: '📡',
    sort_order: 12,
    is_default: true,
  },
  {
    id: 'housing-phone',
    name: 'Phone',
    group: 'HOUSING',
    icon: '📱',
    sort_order: 13,
    is_default: true,
  },
  {
    id: 'housing-maintenance',
    name: 'Home Maintenance',
    group: 'HOUSING',
    icon: '🔧',
    sort_order: 14,
    is_default: false,
    description: 'Repairs, lawn care, pest control',
  },

  // ============================================
  // TRANSPORTATION (15-20% max)
  // ============================================
  {
    id: 'transport-car-payment',
    name: 'Car Payment',
    group: 'TRANSPORTATION',
    icon: '🚗',
    sort_order: 20,
    is_default: false,
    description: 'Dave says pay off ASAP!',
  },
  {
    id: 'transport-gas',
    name: 'Gas & Fuel',
    group: 'TRANSPORTATION',
    icon: '⛽',
    sort_order: 21,
    is_default: true,
  },
  {
    id: 'transport-insurance',
    name: 'Car Insurance',
    group: 'TRANSPORTATION',
    icon: '🛡️',
    sort_order: 22,
    is_default: true,
  },
  {
    id: 'transport-maintenance',
    name: 'Car Maintenance',
    group: 'TRANSPORTATION',
    icon: '🔧',
    sort_order: 23,
    is_default: true,
    description: 'Oil changes, tires, repairs',
  },

  // ============================================
  // FOOD (10-15% of income)
  // ============================================
  {
    id: 'food-groceries',
    name: 'Groceries',
    group: 'FOOD',
    icon: '🛒',
    sort_order: 30,
    is_default: true,
  },
  {
    id: 'food-restaurants',
    name: 'Restaurants',
    group: 'FOOD',
    icon: '🍔',
    sort_order: 31,
    is_default: true,
  },

  // ============================================
  // PERSONAL (5-10%)
  // ============================================
  {
    id: 'personal-clothing',
    name: 'Clothing',
    group: 'PERSONAL',
    icon: '👔',
    sort_order: 40,
    is_default: true,
  },
  {
    id: 'personal-hair-beauty',
    name: 'Hair & Beauty',
    group: 'PERSONAL',
    icon: '💇',
    sort_order: 41,
    is_default: false,
  },
  {
    id: 'personal-entertainment',
    name: 'Entertainment',
    group: 'PERSONAL',
    icon: '🎬',
    sort_order: 42,
    is_default: true,
    description: 'Movies, hobbies, fun money',
  },
  {
    id: 'personal-subscriptions',
    name: 'Subscriptions',
    group: 'PERSONAL',
    icon: '📺',
    sort_order: 43,
    is_default: true,
    description: 'Netflix, Spotify, gym, etc.',
  },
  {
    id: 'personal-misc',
    name: 'Miscellaneous',
    group: 'PERSONAL',
    icon: '💸',
    sort_order: 44,
    is_default: true,
    description: 'Small expenses that do not fit elsewhere',
  },

  // ============================================
  // INSURANCE (10-25%)
  // ============================================
  {
    id: 'insurance-health',
    name: 'Health Insurance',
    group: 'INSURANCE',
    icon: '🏥',
    sort_order: 50,
    is_default: true,
  },
  {
    id: 'insurance-life',
    name: 'Life Insurance',
    group: 'INSURANCE',
    icon: '🛡️',
    sort_order: 51,
    is_default: false,
    description: 'Term life (10-12x income)',
  },

  // ============================================
  // DEBT (Baby Step 2 - PAY OFF!)
  // ============================================
  {
    id: 'debt-credit-cards',
    name: 'Credit Card Payments',
    group: 'DEBT',
    icon: '💳',
    sort_order: 60,
    is_default: false,
    description: 'Debt snowball - smallest to largest',
  },
  {
    id: 'debt-student-loans',
    name: 'Student Loans',
    group: 'DEBT',
    icon: '🎓',
    sort_order: 61,
    is_default: false,
  },
  {
    id: 'debt-personal-loans',
    name: 'Personal Loans',
    group: 'DEBT',
    icon: '💰',
    sort_order: 62,
    is_default: false,
  },
];

// Get default categories for a new budget
export function getDefaultCategories(): MasterCategory[] {
  return DEFAULT_BUDGET_CATEGORIES.filter((cat) => cat.is_default);
}

// Get all categories by group
export function getCategoriesByGroup(group: CategoryGroup): MasterCategory[] {
  return DEFAULT_BUDGET_CATEGORIES.filter((cat) => cat.group === group);
}

// Category group display info
export const CATEGORY_GROUP_INFO: Record<
  CategoryGroup,
  { name: string; icon: string; color: string; recommendedPercent?: string }
> = {
  INCOME: {
    name: 'Income',
    icon: '💰',
    color: '#2E7D32', // Green
  },
  GIVING: {
    name: 'Giving',
    icon: '❤️',
    color: '#D32F2F', // Red
    recommendedPercent: '10%',
  },
  SAVING: {
    name: 'Saving',
    icon: '🏦',
    color: '#1976D2', // Blue
    recommendedPercent: '10-15%',
  },
  HOUSING: {
    name: 'Housing',
    icon: '🏠',
    color: '#F57C00', // Orange
    recommendedPercent: '25-35%',
  },
  TRANSPORTATION: {
    name: 'Transportation',
    icon: '🚗',
    color: '#7B1FA2', // Purple
    recommendedPercent: '10-15%',
  },
  FOOD: {
    name: 'Food',
    icon: '🍔',
    color: '#C62828', // Dark Red
    recommendedPercent: '10-15%',
  },
  PERSONAL: {
    name: 'Personal',
    icon: '🎨',
    color: '#00897B', // Teal
    recommendedPercent: '5-10%',
  },
  INSURANCE: {
    name: 'Insurance',
    icon: '🛡️',
    color: '#5E35B1', // Deep Purple
    recommendedPercent: '10-25%',
  },
  DEBT: {
    name: 'Debt Payments',
    icon: '⛓️',
    color: '#424242', // Gray
    recommendedPercent: 'Pay off ASAP!',
  },
  LIFESTYLE: {
    name: 'Lifestyle',
    icon: '📱',
    color: '#00796B', // Dark Teal
    recommendedPercent: '5-10%',
  },
};

