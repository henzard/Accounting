import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ScreenWrapper, AppText } from '@/presentation/components';
import { SPACING } from '@/shared/constants/spacing';

export default function ModalScreen() {
  return (
    <ScreenWrapper>
      <AppText variant="h1" style={styles.title}>
        This is a modal
      </AppText>
      <Link href="/" dismissTo style={styles.link}>
        <AppText variant="body" style={styles.linkText}>
          Go to home screen
        </AppText>
      </Link>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  title: {
    textAlign: 'center',
    marginBottom: SPACING[6],
  },
  link: {
    marginTop: SPACING[4],
    paddingVertical: SPACING[4],
  },
  linkText: {
    textAlign: 'center',
  },
});
