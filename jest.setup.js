// Jest setup file
try {
  const { polyfill } = require('react-native/Libraries/Animated/NativeAnimatedHelper');
  polyfill();
} catch (error) {
  // polyfill not available in test environment
}

