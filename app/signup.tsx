import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register, isLoading, error, clearError, user } = useAuthStore();
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/(tabs)');
    }
  }, [user, router]);

  useEffect(() => {
    if (error) {
      Alert.alert('Sign Up Error', error);
      clearError();
    }
  }, [error, clearError]);

  const handleSignup = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters');
      return;
    }

    try {
      await register(email, password, fullName);
      // Navigation is handled by the useEffect watching user state
    } catch {
      // Error is handled by the store and displayed via useEffect
    }
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]} 
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <ThemedView style={styles.logoContainer}>
        <ThemedText style={styles.title}>Create Account</ThemedText>
        <ThemedText style={styles.subtitle}>Join Pet App today</ThemedText>
      </ThemedView>

      <ThemedView style={styles.formContainer}>
        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Full Name</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: tintColor,
                color: textColor,
                backgroundColor: backgroundColor,
              },
            ]}
            placeholder="Enter your full name"
            placeholderTextColor={textColor + '80'}
            value={fullName}
            onChangeText={setFullName}
            editable={!isLoading}
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: tintColor,
                color: textColor,
                backgroundColor: backgroundColor,
              },
            ]}
            placeholder="Enter your email"
            placeholderTextColor={textColor + '80'}
            value={email}
            onChangeText={setEmail}
            editable={!isLoading}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Password</ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  borderColor: tintColor,
                  color: textColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={textColor + '80'}
              value={password}
              onChangeText={setPassword}
              editable={!isLoading}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <ThemedText style={styles.eyeIcon}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.inputGroup}>
          <ThemedText style={styles.label}>Confirm Password</ThemedText>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  borderColor: tintColor,
                  color: textColor,
                  backgroundColor: backgroundColor,
                },
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={textColor + '80'}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!isLoading}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              <ThemedText style={styles.eyeIcon}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>

        <TouchableOpacity
          style={[
            styles.signupButton,
            {
              backgroundColor: tintColor,
              opacity: isLoading ? 0.6 : 1,
            },
          ]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={[styles.buttonText, { color: '#fff' }]}>
              Create Account
            </ThemedText>
          )}
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.loginContainer}>
          <ThemedText style={styles.loginText}>Already have an account? </ThemedText>
          <TouchableOpacity onPress={handleBackToLogin} disabled={isLoading}>
            <ThemedText style={[styles.loginLink, { color: tintColor }]}>
              Log in
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  eyeIcon: {
    fontSize: 18,
  },
  signupButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 20,
    opacity: 0.3,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
  },
});
