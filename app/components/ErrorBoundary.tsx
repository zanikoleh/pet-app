/**
 * Error Boundary Component
 * Catches and displays errors gracefully
 */

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 20,
          }}
          contentContainerStyle={{ justifyContent: 'center', minHeight: '100%' }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                marginBottom: 16,
                color: '#000',
              }}
            >
              Oops! Something went wrong
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#666',
                marginBottom: 24,
                textAlign: 'center',
              }}
            >
              {this.state.error?.message || 'An unexpected error occurred'}
            </Text>
            {__DEV__ && this.state.error && (
              <Text
                style={{
                  fontSize: 12,
                  color: '#999',
                  marginBottom: 24,
                  fontFamily: 'monospace',
                  backgroundColor: '#f5f5f5',
                  padding: 12,
                }}
              >
                {this.state.error.stack}
              </Text>
            )}
            <TouchableOpacity
              onPress={this.resetError}
              style={{
                backgroundColor: '#007AFF',
                paddingHorizontal: 32,
                paddingVertical: 12,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      );
    }

    return this.props.children;
  }
}
