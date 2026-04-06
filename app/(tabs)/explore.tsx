import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const { logout, user } = useAuthStore();
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title">Profile</ThemedText>
      </View>

      <ThemedView style={styles.profileCard}>
        <ThemedText type="subtitle">Account Information</ThemedText>
        
        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Name</ThemedText>
          <ThemedText style={styles.value}>{user?.fullName}</ThemedText>
        </View>

        <View style={styles.infoRow}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <ThemedText style={styles.value}>{user?.email}</ThemedText>
        </View>
      </ThemedView>

      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: tintColor }]}
        onPress={handleLogout}
      >
        <ThemedText style={[styles.logoutButtonText, { color: '#fff' }]}>
          Log Out
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  profileCard: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  infoRow: {
    marginTop: 16,
  },
  label: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    marginBottom: 24,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
