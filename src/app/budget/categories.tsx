// Category Tracking Screen - Homebase Budget
// Envelope system: Track planned vs actual spending per category

import React, { useState, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { ScreenHeader, Card, ScreenWrapper, AppText, Input } from '@/presentation/components';
import { Budget, BudgetCategory, CategoryGroup } from '@/domain/entities';
import { CATEGORY_GROUP_INFO } from '@/shared/constants/budget-categories';
import { FirestoreBudgetRepository } from '@/data/repositories/FirestoreBudgetRepository';
import { CurrencyCode, formatCurrency } from '@/shared/utils/currency';
import { showAlert } from '@/shared/utils/alert';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

export default function CategoryTrackingScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  
  // UX State
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const budgetRepository = new FirestoreBudgetRepository();

  const loadHouseholdCurrency = useCallback(async () => {
    if (!user?.default_household_id) return;

    try {
      const householdDoc = await getDoc(
        doc(db, 'households', user.default_household_id)
      );

      if (householdDoc.exists()) {
        const data = householdDoc.data();
        setHouseholdCurrency((data.currency as CurrencyCode) || 'USD');
      }
    } catch (error) {
      console.error('Error loading household currency:', error);
    }
  }, [user?.default_household_id]);

  const loadBudget = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }

    try {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      const existingBudget = await budgetRepository.getBudgetByMonth(
        user.default_household_id,
        currentMonth,
        currentYear
      );

      if (existingBudget) {
        setBudget(existingBudget);
      } else {
        router.back();
        showAlert('No Budget Found', 'Please create a budget for this month first.');
      }
    } catch (error) {
      console.error('Error loading budget:', error);
      showAlert('Error', 'Failed to load budget');
    } finally {
      setLoading(false);
    }
  }, [user?.default_household_id, budgetRepository, router]);

  useFocusEffect(
    useCallback(() => {
      loadBudget();
      loadHouseholdCurrency();
    }, [loadBudget, loadHouseholdCurrency])
  );

  // Filter and group categories
  const getFilteredAndGroupedCategories = () => {
    if (!budget) return {};

    const filtered = budget.categories.filter((cat) => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        cat.name.toLowerCase().includes(query) ||
        cat.group.toLowerCase().includes(query)
      );
    });

    // Group by CategoryGroup
    const grouped: Record<CategoryGroup, BudgetCategory[]> = {
      INCOME: [],
      GIVING: [],
      SAVING: [],
      HOUSING: [],
      TRANSPORTATION: [],
      FOOD: [],
      PERSONAL: [],
      INSURANCE: [],
      DEBT: [],
      LIFESTYLE: [],
    };

    filtered.forEach((cat) => {
      if (grouped[cat.group]) {
        grouped[cat.group].push(cat);
      }
    });

    // Sort categories within each group by sort_order
    Object.keys(grouped).forEach((group) => {
      grouped[group as CategoryGroup].sort((a, b) => a.sort_order - b.sort_order);
    });

    return grouped;
  };

  // Calculate category status
  const getCategoryStatus = (category: BudgetCategory) => {
    const planned = category.planned_amount;
    const actual = category.actual_amount;
    const percentage = planned > 0 ? (actual / planned) * 100 : 0;
    const remaining = planned - actual;

    if (percentage >= 100) {
      return { status: 'overspent', color: theme.status.error, bgColor: theme.status.errorBackground };
    } else if (percentage >= 80) {
      return { status: 'warning', color: theme.status.warning, bgColor: theme.status.warningBackground };
    } else {
      return { status: 'good', color: theme.status.success, bgColor: theme.status.successBackground };
    }
  };

  // Toggle group collapse
  const toggleGroup = (group: CategoryGroup) => {
    const newCollapsed = new Set(collapsedGroups);
    if (newCollapsed.has(group)) {
      newCollapsed.delete(group);
    } else {
      newCollapsed.add(group);
    }
    setCollapsedGroups(newCollapsed);
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Category Tracking" showBack={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
          <AppText variant="body" style={{ color: theme.text.secondary, marginTop: SPACING[4] }}>
            Loading categories...
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  if (!budget) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Category Tracking" showBack={true} />
        <View style={styles.emptyContainer}>
          <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }}>
            No budget found for this month.
          </AppText>
        </View>
      </ScreenWrapper>
    );
  }

  const groupedCategories = getFilteredAndGroupedCategories();
  const totalCategories = budget.categories.length;
  const filteredCount = Object.values(groupedCategories).reduce(
    (sum, cats) => sum + cats.length,
    0
  );

  return (
    <ScreenWrapper>
      <ScreenHeader title="Category Tracking" showBack={true} />

      <ScrollView style={styles.scrollView}>
        {/* Search Bar */}
        {totalCategories >= 10 && (
          <View style={styles.searchContainer}>
            <Input
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search categories..."
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <AppText variant="body" style={{ color: theme.text.secondary }}>Clear</AppText>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <AppText variant="bodyEmphasis" style={{ color: theme.text.secondary }}>
              Total Categories
            </AppText>
            <AppText variant="h3" style={{ color: theme.text.primary }}>
              {filteredCount}
            </AppText>
          </View>
        </Card>

        {/* Category Groups */}
        {Object.entries(groupedCategories).map(([group, categories]) => {
          if (categories.length === 0) return null;

          const groupInfo = CATEGORY_GROUP_INFO[group as CategoryGroup];
          const isCollapsed = collapsedGroups.has(group as CategoryGroup);
          const totalPlanned = categories.reduce((sum, cat) => sum + cat.planned_amount, 0);
          const totalActual = categories.reduce((sum, cat) => sum + cat.actual_amount, 0);
          const totalRemaining = totalPlanned - totalActual;

          return (
            <Card key={group} style={styles.groupCard}>
              {/* Group Header */}
              <TouchableOpacity
                onPress={() => toggleGroup(group as CategoryGroup)}
                style={styles.groupHeader}
              >
                <View style={styles.groupHeaderLeft}>
                  {groupInfo.icon && (
                    <AppText variant="h2" style={styles.groupIcon}>{groupInfo.icon}</AppText>
                  )}
                  <View>
                    <AppText variant="h3" style={{ color: theme.text.primary }}>
                      {groupInfo.name}
                    </AppText>
                    <AppText variant="caption" style={{ color: theme.text.secondary, marginTop: SPACING[1] }}>
                      {categories.length} {categories.length === 1 ? 'category' : 'categories'}
                    </AppText>
                  </View>
                </View>
                <View style={styles.groupHeaderRight}>
                  <AppText variant="body" style={{ color: theme.text.secondary, marginBottom: SPACING[1] }}>
                    {formatCurrency(totalRemaining, householdCurrency)} remaining
                  </AppText>
                  <AppText variant="caption" style={{ color: theme.text.tertiary }}>
                    {isCollapsed ? '▼' : '▲'}
                  </AppText>
                </View>
              </TouchableOpacity>

              {/* Categories */}
              {!isCollapsed && (
                <View style={styles.categoriesList}>
                  {categories.map((category) => {
                    const status = getCategoryStatus(category);
                    const percentage = category.planned_amount > 0
                      ? Math.min((category.actual_amount / category.planned_amount) * 100, 100)
                      : 0;
                    const remaining = category.planned_amount - category.actual_amount;

                    return (
                      <View key={category.id} style={styles.categoryItem}>
                        {/* Category Header */}
                        <View style={styles.categoryHeader}>
                          <View style={styles.categoryInfo}>
                            {category.icon && (
                              <AppText variant="body" style={styles.categoryIcon}>{category.icon}</AppText>
                            )}
                            <View style={styles.categoryText}>
                              <AppText variant="bodyEmphasis" style={{ color: theme.text.primary, marginBottom: SPACING[1] }}>
                                {category.name}
                              </AppText>
                              <AppText variant="caption" style={{ color: theme.text.secondary }}>
                                {formatCurrency(category.actual_amount, householdCurrency)} /{' '}
                                {formatCurrency(category.planned_amount, householdCurrency)}
                              </AppText>
                            </View>
                          </View>
                          <View style={[styles.statusBadge, { backgroundColor: status.bgColor }]}>
                            <AppText variant="body" style={{ color: status.color }}>
                              {remaining >= 0
                                ? formatCurrency(remaining, householdCurrency)
                                : `-${formatCurrency(Math.abs(remaining), householdCurrency)}`}
                            </AppText>
                          </View>
                        </View>

                        {/* Progress Bar */}
                        <View style={[styles.progressBarContainer, { backgroundColor: theme.background.secondary }]}>
                          <View
                            style={[
                              styles.progressBar,
                              {
                                width: `${percentage}%`,
                                backgroundColor: status.color,
                              },
                            ]}
                          />
                        </View>

                        {/* Percentage */}
                        <AppText variant="caption" style={{ color: theme.text.tertiary, marginTop: SPACING[1] }}>
                          {percentage.toFixed(0)}% spent
                        </AppText>
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          );
        })}

        {/* Empty State */}
        {filteredCount === 0 && (
          <Card style={styles.emptyCard}>
            <AppText variant="body" style={{ color: theme.text.secondary, textAlign: 'center' }}>
              {searchQuery
                ? `No categories found matching "${searchQuery}"`
                : 'No categories in this budget'}
            </AppText>
          </Card>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[8],
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING[8],
  },
  searchContainer: {
    padding: SPACING[4],
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    padding: SPACING[2],
    marginLeft: SPACING[2],
  },
  summaryCard: {
    margin: SPACING[4],
    marginBottom: SPACING[2],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  groupCard: {
    margin: SPACING[4],
    marginBottom: SPACING[2],
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: SPACING[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  groupHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  groupIcon: {
    marginRight: SPACING[3],
  },
  groupHeaderRight: {
    alignItems: 'flex-end',
  },
  categoriesList: {
    marginTop: SPACING[3],
  },
  categoryItem: {
    marginBottom: SPACING[4],
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING[2],
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryIcon: {
    marginRight: SPACING[3],
  },
  categoryText: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING[3],
    paddingVertical: SPACING[1],
    borderRadius: BORDER_RADIUS.md,
    marginLeft: SPACING[2],
  },
  progressBarContainer: {
    height: 8,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING[1],
  },
  progressBar: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm,
  },
  emptyCard: {
    margin: SPACING[4],
    padding: SPACING[8],
    alignItems: 'center',
  },
});
