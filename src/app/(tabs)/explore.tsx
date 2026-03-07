// More/Settings Screen - Homebase Budget
// User settings, preferences, and navigation to other features

import React, { ComponentProps } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/infrastructure/theme';
import { useAuth } from '@/infrastructure/auth';
import { showAlert, showConfirm } from '@/shared/utils/alert';
import { Card, HouseholdSwitcherButton, ThemeToggleButton, ScreenWrapper, AppText } from '@/presentation/components';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { SPACING, BORDER_RADIUS } from '@/shared/constants/spacing';

interface MenuItemProps {
  icon: ComponentProps<typeof IconSymbol>['name'];
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
        <AppText variant="bodyEmphasis" style={{ marginBottom: SPACING[1] }}>
          {label}
        </AppText>
        {subtitle && (
          <AppText variant="caption" color={theme.text.secondary}>
            {subtitle}
          </AppText>
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
    const confirmed = await showConfirm(
      'Sign Out',
      'Are you sure you want to sign out?'
    );

    if (!confirmed) return;

    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('❌ Sign out failed:', error);
      showAlert('Error', 'Failed to sign out');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.content}
      >
        {/* Header with Household Switcher and Theme Toggle */}
        <View style={[styles.header, { borderBottomColor: theme.border.default }]}>
          <View style={styles.headerTop}>
            <AppText variant="h1">
              More
            </AppText>
            <View style={styles.headerRight}>
              <HouseholdSwitcherButton size={20} testID="more-household-switcher" />
              <View style={{ marginLeft: SPACING[2] }} />
              <ThemeToggleButton size={20} testID="more-theme-toggle" />
            </View>
          </View>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={[styles.avatarContainer, { backgroundColor: theme.interactive.primary }]}>
            <AppText variant="h2" color={theme.text.inverse}>
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </AppText>
          </View>
          <View style={styles.userInfo}>
            <AppText variant="h2" style={{ marginBottom: SPACING[1] }}>
              {user?.name || 'User'}
            </AppText>
            <AppText variant="caption" color={theme.text.secondary}>
              {user?.email}
            </AppText>
          </View>
        </Card>

        {/* Financial Section */}
        <View style={styles.section}>
          <AppText variant="overline" color={theme.text.secondary} style={{ marginBottom: SPACING[2], marginLeft: SPACING[1] }}>
            FINANCIAL
          </AppText>
        
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
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="dollarsign.circle.fill"
            label="Debt Snowball"
            subtitle="Pay off debts smallest first"
            onPress={() => router.push('/debts')}
          />
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="briefcase.fill"
            label="Businesses"
            subtitle="Manage businesses and employers"
            onPress={() => router.push('/businesses')}
          />
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="doc.text.fill"
            label="Reimbursement Claims"
            subtitle="Track expense claims and reimbursements"
            onPress={() => router.push('/claims')}
          />
        </Card>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <AppText variant="overline" color={theme.text.secondary} style={{ marginBottom: SPACING[2], marginLeft: SPACING[1] }}>
          SETTINGS
        </AppText>
        
        <Card>
          <MenuItem
            icon="gearshape.fill"
            label="Household Settings"
            subtitle="Budget period, currency, timezone"
            onPress={() => router.push('/household/settings')}
          />
          
          <View style={[styles.divider, { backgroundColor: theme.border.default }]} />
          
          <MenuItem
            icon="house.fill"
            label="Manage Households"
            subtitle="View, switch, or delete households"
            onPress={() => router.push('/household/manage')}
          />
        </Card>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <AppText variant="overline" color={theme.text.secondary} style={{ marginBottom: SPACING[2], marginLeft: SPACING[1] }}>
          ABOUT
        </AppText>
        
        <Card>
          <MenuItem
            icon="info.circle.fill"
            label="App Version"
            subtitle="1.0.0 (Phase 5.6)"
            onPress={() => {
              showAlert('Homebase Budget', 'Version 1.0.0\nDave Ramsey Budget Tracker\n\nPhase 5.6: Transaction Entry Complete');
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
        <AppText variant="button" color={theme.status.error}>
          Sign Out
        </AppText>
      </TouchableOpacity>

      {/* Spacer for bottom tab */}
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingTop: SPACING[2],
    paddingBottom: SPACING[10],
  },
  header: {
    paddingTop: SPACING[2],
    paddingBottom: SPACING[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: SPACING[6],
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING[6],
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[4],
  },
  userInfo: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING[6],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING[3],
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING[3],
  },
  menuContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginVertical: SPACING[1],
  },
  signOutButton: {
    paddingVertical: SPACING[4],
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
  },
});
