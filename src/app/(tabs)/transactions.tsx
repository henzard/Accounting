// Transactions Screen - List all transactions with real-time updates
// Follows UX Standards: search, date grouping, empty state

import React, { useState, useEffect, useCallback } from 'react';
import { 
  ScrollView, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, ScreenHeader, ScreenWrapper, AppText, PrimaryButton } from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';
import { FirestoreTransactionRepository } from '@/data/repositories/FirestoreTransactionRepository';
import { Transaction } from '@/domain/entities/Transaction';
import { formatCurrency, CurrencyCode } from '@/shared/utils/currency';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/infrastructure/firebase';

// Date grouping helper
function getDateGroup(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const transactionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  const diffDays = Math.floor((today.getTime() - transactionDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return 'This Week';
  if (diffDays < 30) return 'This Month';
  
  // Format as "Month Year" for older
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Group transactions by date
function groupTransactionsByDate(transactions: Transaction[]): Map<string, Transaction[]> {
  const groups = new Map<string, Transaction[]>();
  
  transactions.forEach(transaction => {
    const group = getDateGroup(transaction.date);
    if (!groups.has(group)) {
      groups.set(group, []);
    }
    groups.get(group)!.push(transaction);
  });
  
  return groups;
}

export default function TransactionsScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [householdCurrency, setHouseholdCurrency] = useState<CurrencyCode>('USD');
  
  const transactionRepo = new FirestoreTransactionRepository();
  
  // Load transactions
  const loadTransactions = useCallback(async () => {
    if (!user?.default_household_id) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      
      // Load household currency
      const householdDoc = await getDoc(doc(db, 'households', user.default_household_id));
      if (householdDoc.exists()) {
        setHouseholdCurrency((householdDoc.data().currency as CurrencyCode) || 'USD');
      }
      
      // Load transactions
      const txns = await transactionRepo.getTransactionsByHousehold(user.default_household_id);
      setTransactions(txns);
    } catch (error) {
      console.error('❌ Failed to load transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.default_household_id]);
  
  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
  };
  
  // Reload when screen comes into focus (e.g., after adding/deleting)
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [loadTransactions])
  );
  
  // Filter transactions by search
  const filteredTransactions = transactions.filter(txn => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      txn.payee?.toLowerCase().includes(query) ||
      txn.notes?.toLowerCase().includes(query) ||
      // Search in formatted amount (convert cents to display format for search)
      formatCurrency(txn.amount, householdCurrency).toLowerCase().includes(query)
    );
  });
  
  // Group filtered transactions
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  // Empty state
  if (!loading && transactions.length === 0) {
    return (
      <ScreenWrapper>
        <ScreenHeader 
          title="Transactions" 
          rightAction={
            <TouchableOpacity 
              onPress={() => router.push('/transactions/add')}
              style={styles.addButton}
            >
              <IconSymbol name="plus" size={20} color={theme.interactive.primary} />
            </TouchableOpacity>
          }
        />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: SPACING[8] }}>
          <AppText variant="display" style={{ marginBottom: SPACING[4] }}>💸</AppText>
          <AppText variant="h2" style={{ marginBottom: SPACING[2] }}>
            No Transactions Yet
          </AppText>
          <AppText variant="body" color={theme.text.secondary} style={{ textAlign: 'center', marginBottom: SPACING[6] }}>
            Start tracking your spending by adding your first transaction
          </AppText>
          <PrimaryButton
            title="Add Transaction"
            onPress={() => router.push('/transactions/add')}
            size="lg"
          />
        </View>
      </ScreenWrapper>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <ScreenWrapper>
        <ScreenHeader title="Transactions" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </ScreenWrapper>
    );
  }
  
  return (
    <ScreenWrapper>
      <ScreenHeader 
        title="Transactions" 
        rightAction={
          <TouchableOpacity 
            onPress={() => router.push('/transactions/add')}
            style={styles.addButton}
          >
            <IconSymbol name="plus" size={20} color={theme.interactive.primary} />
          </TouchableOpacity>
        }
      />
      
      <ScrollView
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={handleRefresh}
            tintColor={theme.interactive.primary}
          />
        }
        style={{ flex: 1 }}
      >
        {/* Search Bar */}
        {transactions.length >= 10 && (
          <View style={{ padding: SPACING[4] }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                paddingVertical: SPACING[3],
                paddingHorizontal: SPACING[4],
                borderRadius: BORDER_RADIUS.sm,
                fontSize: 16,
              }}
            />
          </View>
        )}
        
        {/* Grouped Transactions */}
        <View style={{ padding: SPACING[4] }}>
          {Array.from(groupedTransactions.entries()).map(([group, groupTransactions]) => (
            <View key={group} style={{ marginBottom: SPACING[6] }}>
              {/* Date Group Header */}
              <AppText variant="overline" color={theme.text.secondary} style={{ marginBottom: SPACING[2] }}>
                {group}
              </AppText>
              
              {/* Transactions in Group */}
              {groupTransactions.map((transaction) => (
                <Link 
                  key={transaction.id} 
                  href={`/transactions/${transaction.id}`}
                  asChild
                >
                  <TouchableOpacity style={{ marginBottom: SPACING[2] }}>
                    <Card padding="md">
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <AppText variant="bodyEmphasis" style={{ marginBottom: SPACING[1] }}>
                            {transaction.payee || 'Transaction'}
                          </AppText>
                          <AppText variant="caption" color={theme.text.secondary}>
                            {transaction.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: transaction.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                            {transaction.notes && ` • ${transaction.notes.substring(0, 30)}${transaction.notes.length > 30 ? '...' : ''}`}
                          </AppText>
                        </View>
                        
                        <AppText 
                          variant="h2"
                          color={transaction.type === 'INCOME' ? theme.financial.income : theme.financial.expense}
                          style={{ marginLeft: SPACING[4] }}
                        >
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount, householdCurrency)}
                        </AppText>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ))}
          
          {/* No Search Results */}
          {filteredTransactions.length === 0 && searchQuery && (
            <View style={{ padding: SPACING[8], alignItems: 'center' }}>
              <AppText variant="display" style={{ marginBottom: SPACING[4] }}>🔍</AppText>
              <AppText variant="body" color={theme.text.secondary} style={{ textAlign: 'center' }}>
                No transactions match &quot;{searchQuery}&quot;
              </AppText>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  addButton: {
    width: 44, // Premium UI: Minimum 44×44px touch target
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
