import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/auth/auth-context';

export default function SignInScreen() {
  const { status, session, errorMessage, signInWithGoogle, signOut } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const run = async (action: () => Promise<void>) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await action();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <View>
          <Text style={styles.brand}>KoReady</Text>
          <Text style={styles.description}>한국에서 나만의 로컬 여행을 시작하세요.</Text>
        </View>

        {status === 'signedIn' && session ? (
          <View style={styles.actions}>
            <Text style={styles.account}>{session.user.email}</Text>
            <Pressable
              accessibilityRole="button"
              disabled={submitting}
              onPress={() => run(signOut)}
              style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            >
              <Text style={styles.secondaryButtonText}>로그아웃</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              disabled={submitting || status === 'restoring'}
              onPress={() => run(signInWithGoogle)}
              style={({ pressed }) => [
                styles.googleButton,
                pressed && styles.pressed,
                (submitting || status === 'restoring') && styles.disabled,
              ]}
            >
              {submitting || status === 'restoring' ? (
                <ActivityIndicator color="#202124" />
              ) : (
                <>
                  <Text style={styles.googleMark}>G</Text>
                  <Text style={styles.googleButtonText}>Google로 계속하기</Text>
                </>
              )}
            </Pressable>
            {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 32,
  },
  brand: {
    color: '#111827',
    fontSize: 40,
    fontWeight: '800',
  },
  description: {
    color: '#4B5563',
    fontSize: 17,
    lineHeight: 26,
    marginTop: 12,
  },
  actions: {
    gap: 12,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  googleMark: {
    color: '#4285F4',
    fontSize: 20,
    fontWeight: '700',
    marginRight: 12,
  },
  googleButtonText: {
    color: '#202124',
    fontSize: 16,
    fontWeight: '600',
  },
  account: {
    color: '#374151',
    fontSize: 15,
    textAlign: 'center',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 6,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#B42318',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  disabled: {
    opacity: 0.55,
  },
});
