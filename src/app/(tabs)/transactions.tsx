// Transactions Screen - List all transactions with real-time updates
// Follows UX Standards: search, date grouping, empty state

import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card, ScreenHeader } from '@/presentation/components';
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
  const loadTransactions = async () => {
    if (!user?.default_household_id) return;
    
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
    }
  };
  
  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  };
  
  // Initial load
  useEffect(() => {
    loadTransactions();
  }, [user?.default_household_id]);
  
  // Filter transactions by search
  const filteredTransactions = transactions.filter(txn => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      txn.payee?.toLowerCase().includes(query) ||
      txn.notes?.toLowerCase().includes(query) ||
      formatCurrency(txn.amount, householdCurrency).toLowerCase().includes(query)
    );
  });
  
  // Group filtered transactions
  const groupedTransactions = groupTransactionsByDate(filteredTransactions);
  
  // Empty state
  if (!loading && transactions.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader 
          title="Transactions" 
          rightAction={
            <TouchableOpacity onPress={() => router.push('/transactions/add')}>
              <Text style={{ color: theme.interactive.primary, fontSize: 24, fontWeight: 'bold' }}>
                +
              </Text>
            </TouchableOpacity>
          }
        />
        
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>💸</Text>
          <Text style={{ fontSize: 20, fontWeight: '600', color: theme.text.primary, marginBottom: 8 }}>
            No Transactions Yet
          </Text>
          <Text style={{ fontSize: 16, color: theme.text.secondary, textAlign: 'center', marginBottom: 24 }}>
            Start tracking your spending by adding your first transaction
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/transactions/add')}
            style={{
              backgroundColor: theme.interactive.primary,
              paddingVertical: 12,
              paddingHorizontal: 32,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>
              Add Transaction
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
        <ScreenHeader title="Transactions" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.interactive.primary} />
        </View>
      </View>
    );
  }
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.background.primary }}>
      <ScreenHeader 
        title="Transactions" 
        rightAction={
          <TouchableOpacity onPress={() => router.push('/transactions/add')}>
            <Text style={{ color: theme.interactive.primary, fontSize: 24, fontWeight: 'bold' }}>
              +
            </Text>
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
          <View style={{ padding: 16 }}>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search transactions..."
              placeholderTextColor={theme.text.tertiary}
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
                paddingVertical: 12,
                paddingHorizontal: 16,
                borderRadius: 8,
                fontSize: 16,
              }}
            />
          </View>
        )}
        
        {/* Grouped Transactions */}
        <View style={{ padding: 16 }}>
          {Array.from(groupedTransactions.entries()).map(([group, groupTransactions]) => (
            <View key={group} style={{ marginBottom: 24 }}>
              {/* Date Group Header */}
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: theme.text.secondary,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}>
                {group}
              </Text>
              
              {/* Transactions in Group */}
              {groupTransactions.map((transaction) => (
                <Link 
                  key={transaction.id} 
                  href={`/transactions/${transaction.id}`}
                  asChild
                >
                  <TouchableOpacity style={{ marginBottom: 8 }}>
                    <Card padding="md">
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ 
                            color: theme.text.primary, 
                            fontSize: 16, 
                            fontWeight: '600',
                            marginBottom: 4,
                          }}>
                            {transaction.payee || 'Transaction'}
                          </Text>
                          <Text style={{ color: theme.text.secondary, fontSize: 14 }}>
                            {transaction.date.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              year: transaction.date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                            {transaction.notes && ` • ${transaction.notes.substring(0, 30)}${transaction.notes.length > 30 ? '...' : ''}`}
                          </Text>
                        </View>
                        
                        <Text style={{ 
                          color: transaction.type === 'INCOME' ? theme.financial.income : theme.financial.expense,
                          fontSize: 18, 
                          fontWeight: '600',
                          marginLeft: 16,
                        }}>
                          {transaction.type === 'INCOME' ? '+' : '-'}
                          {formatCurrency(transaction.amount, householdCurrency)}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                </Link>
              ))}
            </View>
          ))}
          
          {/* No Search Results */}
          {filteredTransactions.length === 0 && searchQuery && (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>🔍</Text>
              <Text style={{ fontSize: 16, color: theme.text.secondary, textAlign: 'center' }}>
                No transactions match "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
