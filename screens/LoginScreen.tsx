import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";

import { loginWithEmail, registerWithEmail } from "../backend/fire";

/**
 * Authentication mode for the login screen
 */
type AuthMode = "login" | "register";

/**
 * Login/Register screen component
 * Provides email/password authentication with Firebase
 */
export function LoginScreen() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  /**
   * Validate form inputs
   */
  const validateForm = (): boolean => {
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return false;
    }

    if (!password) {
      setError("Please enter your password.");
      return false;
    }

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }

    if (mode === "register" && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }

    return true;
  };

  /**
   * Handle login submission
   */
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    const result = await loginWithEmail(email, password);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Login failed.");
    }
    // Navigation happens automatically via auth state change
  };

  /**
   * Handle registration submission
   */
  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    const result = await registerWithEmail(email, password);

    setIsLoading(false);

    if (!result.success) {
      setError(result.error ?? "Registration failed.");
    }
    // Navigation happens automatically via auth state change
  };

  /**
   * Handle form submission based on current mode
   */
  const handleSubmit = () => {
    switch (mode) {
      case "login":
        handleLogin();
        break;
      case "register":
        handleRegister();
        break;
    }
  };

  /**
   * Switch between authentication modes
   */
  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setSuccessMessage(null);
  };

  /**
   * Get the title based on current mode
   */
  const getTitle = (): string => {
    return mode === "login" ? "Login" : "Create Account";
  };

  /**
   * Get the submit button text based on current mode
   */
  const getSubmitButtonText = (): string => {
    return mode === "login" ? "Login" : "Create Account";
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}>
          <Text style={styles.title}>{getTitle()}</Text>
          <Text style={styles.appName}>Morse Player</Text>

          {/* Error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success message */}
          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Email input */}
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Password input */}
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            editable={!isLoading}
          />

          {/* Confirm password input (only for register mode) */}
          {mode === "register" && (
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#888"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {getSubmitButtonText()}
              </Text>
            )}
          </TouchableOpacity>

          {/* Mode switch links */}
          <View style={styles.linksContainer}>
            {mode === "login" && (
              <TouchableOpacity onPress={() => switchMode("register")}>
                <Text style={styles.linkHighlight}>Sign up</Text>
              </TouchableOpacity>
            )}

            {mode === "register" && (
              <TouchableOpacity onPress={() => switchMode("login")}>
                <Text style={styles.linkHighlight}>Login</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },
  formContainer: {
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 4,
  },
  appName: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 14,
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
    padding: 14,
    alignItems: "center",
    marginTop: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linksContainer: {
    marginTop: 20,
    alignItems: "center",
    gap: 10,
  },
  linkHighlight: {
    color: "#007AFF",
  },
  errorContainer: {
    backgroundColor: "#fee",
    borderRadius: 6,
    padding: 10,
  },
  errorText: {
    color: "#c00",
    fontSize: 14,
    textAlign: "center",
  },
  successContainer: {
    backgroundColor: "#efe",
    borderRadius: 6,
    padding: 10,
  },
  successText: {
    color: "#060",
    fontSize: 14,
    textAlign: "center",
  },
});
