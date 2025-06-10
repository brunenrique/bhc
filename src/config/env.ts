
/**
 * @fileOverview Centralized environment variable configuration.
 *
 * This module reads environment variables, provides default values where appropriate,
 * and exports them in a typed and easily accessible object.
 *
 * Never access process.env directly in other parts of the application.
 * Always import from this ENV object.
 */

// Helper function to get a boolean environment variable
const getBooleanEnv = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key];
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true';
};

// Helper function to get a number environment variable
const getNumberEnv = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

// Helper function to get a string environment variable, with a fallback
const getStringEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

export const ENV = {
  // Firebase Configuration
  FIREBASE_API_KEY: getStringEnv('NEXT_PUBLIC_FIREBASE_API_KEY', 'mock-api-key-from-env-ts'),
  FIREBASE_AUTH_DOMAIN: getStringEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 'mock-project-id.firebaseapp.com'),
  FIREBASE_PROJECT_ID: getStringEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID', 'mock-project-id'),
  FIREBASE_STORAGE_BUCKET: getStringEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', 'mock-project-id.appspot.com'),
  FIREBASE_MESSAGING_SENDER_ID: getStringEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', 'mock-sender-id'),
  FIREBASE_APP_ID: getStringEnv('NEXT_PUBLIC_FIREBASE_APP_ID', 'mock-app-id'),
  FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional, can be undefined

  // Application Specific Configuration
  SESSION_TIMEOUT_MS: getNumberEnv('NEXT_PUBLIC_SESSION_TIMEOUT_MS', 30 * 60 * 1000), // Default to 30 minutes

  // Development/Emulator Configuration
  USE_FIREBASE_EMULATORS: getBooleanEnv('NEXT_PUBLIC_USE_FIREBASE_EMULATORS', process.env.NODE_ENV === 'development'),

  // Node environment
  NODE_ENV: getStringEnv('NODE_ENV', 'development'),
};

// Log a warning if essential Firebase variables are missing and not in a test environment
if (ENV.NODE_ENV !== 'test' && ENV.NODE_ENV !== 'production') { // Don't log during tests or prod builds if vars are intentionally missing for build
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    console.warn(
      "Warning: NEXT_PUBLIC_FIREBASE_API_KEY is not set. Using default mock value. Firebase services might not work as expected."
    );
  }
}
