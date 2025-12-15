// More/Settings Screen - Homebase Budget
// User settings, preferences, and navigation to other features

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { Card } from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface MenuItemProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress: () => void;
  color?: string;
}

function MenuItem({ icon, label, subtitle, onPress, color }: MenuItemProps) {
  const { theme } = useTheme();
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.menuItem}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color || theme.interactive.primary + '20' }]}>
        <IconSymbol name={icon} size={24} color={color || theme.interactive.primary} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color: theme.text.primary }]}>
          {label}
        </Text>
        {subtitle && (
          <Text style={[styles.menuSubtitle, { color: theme.text.secondary }]}>
            {subtitle}
          </Text>
        )}
      </View>
      <IconSymbol name="chevron.right" size={20} color={theme.text.tertiary} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/login');
            } catch (error) {
              console.error('❌ Sign out failed:', error);
              Alert.alert('Error', 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      contentContainerStyle={styles.content}
    >
      {/* User Info Card */}
      <Card style={styles.userCard}>
        <View style={[styles.avatarContainer, { backgroundColor: theme.interactive.primary }]}>
          <Text style={[styles.avatarText, { color: theme.text.inverse }]}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: theme.text.primary }]}>
            {user?.name || 'User'}
          </Text>
          <Text style={[styles.userEmail, { color: theme.text.secondary }]}>
            {user?.email}
          </Text>
        </View>
      </Card>

      {/* Financial Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
          FINANCIAL
        </Text>
        
        <Card>
          <MenuItem
            icon="house.fill"
            label="Accounts"
            subtitle="Manage your accounts"
            onPress={() => router.push('/accounts')}
          />
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="chart.pie.fill"
            label="Baby Steps"
            subtitle="Track your financial journey"
            onPress={() => router.push('/baby-steps/select')}
          />
        </Card>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
          SETTINGS
        </Text>
        
        <Card>
          <MenuItem
            icon="building.2.fill"
            label="Household"
            subtitle="Manage household settings"
            onPress={() => {
              Alert.alert('Coming Soon', 'Household management will be available in Phase 6.0');
            }}
          />
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="dollarsign.circle.fill"
            label="Currency & Timezone"
            subtitle={`${user?.currency || 'USD'} · ${user?.timezone || 'UTC'}`}
            onPress={() => {
              Alert.alert('Coming Soon', 'Settings will be available soon');
            }}
          />
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text.secondary }]}>
          ABOUT
        </Text>
        
        <Card>
          <MenuItem
            icon="info.circle.fill"
            label="App Version"
            subtitle="1.0.0 (Phase 5.4)"
            onPress={() => {
              Alert.alert('Homebase Budget', 'Version 1.0.0\nDave Ramsey Budget Tracker');
            }}
            color={theme.status.info}
          />
        </Card>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity
        onPress={handleSignOut}
        style={[styles.signOutButton, { backgroundColor: theme.status.errorBackground }]}
      >
        <Text style={[styles.signOutText, { color: theme.status.error }]}>
          Sign Out
        </Text>
      </TouchableOpacity>

      {/* Spacer for bottom tab */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginVertical: 4,
  },
  signOutButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
