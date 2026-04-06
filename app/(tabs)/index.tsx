import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuthStore } from '@/store/auth-store';
import { usePets } from '@/store/pet-store';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

export default function PetsScreen() {
  const { user } = useAuthStore();
  const { data: pets, isLoading, error } = usePets();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <View style={styles.header}>
        <ThemedText type="title">My Pets</ThemedText>
        <ThemedText style={styles.subtitle}>Welcome, {user?.fullName || 'User'}!</ThemedText>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={tintColor} />
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <ThemedText style={styles.errorText}>Failed to load pets</ThemedText>
        </View>
      ) : pets && pets.length > 0 ? (
        <FlatList
          data={pets}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ThemedView style={[styles.petCard, { borderColor: tintColor }]}>
              <ThemedText type="defaultSemiBold" style={styles.petName}>
                {item.name}
              </ThemedText>
              <ThemedText style={styles.petInfo}>Breed: {item.breed}</ThemedText>
              <ThemedText style={styles.petInfo}>Age: {item.age} years old</ThemedText>
            </ThemedView>
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No pets yet</ThemedText>
          <ThemedText style={styles.emptySubtext}>Add your first pet to get started</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  subtitle: {
    marginTop: 4,
    opacity: 0.6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  petCard: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginVertical: 8,
  },
  petName: {
    fontSize: 18,
    marginBottom: 8,
  },
  petInfo: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.6,
  },
  errorText: {
    fontSize: 16,
    color: '#FF6B6B',
  },
});
