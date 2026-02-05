import 'react-native-get-random-values'; // Must be first for uuid
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/infrastructure/theme';
import { AuthProvider } from '@/infrastructure/auth';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider initialMode="system">
      <AuthProvider>
        <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            <Stack.Screen name="firebase-test" options={{ presentation: 'modal', title: 'Firebase Test' }} />
            <Stack.Screen name="components-demo" options={{ presentation: 'modal', title: 'Components' }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="signup" options={{ headerShown: false }} />
            <Stack.Screen name="household/create" options={{ headerShown: false }} />
            <Stack.Screen name="household/select" options={{ headerShown: false }} />
            <Stack.Screen name="household/settings" options={{ headerShown: false }} />
            <Stack.Screen name="household/manage" options={{ headerShown: false }} />
            <Stack.Screen name="household/members" options={{ headerShown: false }} />
            <Stack.Screen name="baby-steps/select" options={{ headerShown: false }} />
            <Stack.Screen name="accounts/index" options={{ headerShown: false }} />
            <Stack.Screen name="accounts/add" options={{ headerShown: false }} />
            <Stack.Screen name="accounts/edit" options={{ headerShown: false }} />
            <Stack.Screen name="budget/index" options={{ headerShown: false }} />
            <Stack.Screen name="budget/manage-categories" options={{ headerShown: false }} />
            <Stack.Screen name="budget/categories" options={{ headerShown: false }} />
            <Stack.Screen name="transactions/add" options={{ headerShown: false }} />
            <Stack.Screen name="transactions/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="debts/index" options={{ headerShown: false }} />
            <Stack.Screen name="debts/add" options={{ headerShown: false }} />
            <Stack.Screen name="businesses/index" options={{ headerShown: false }} />
            <Stack.Screen name="businesses/add" options={{ headerShown: false }} />
            <Stack.Screen name="businesses/edit" options={{ headerShown: false }} />
            <Stack.Screen name="claims/index" options={{ headerShown: false }} />
            <Stack.Screen name="claims/add" options={{ headerShown: false }} />
            <Stack.Screen name="claims/[id]" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
        </NavigationThemeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
