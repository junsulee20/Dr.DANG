import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useState } from 'react';
import { emailSignup, KakaoLoginResponse, setAuthToken } from '@/lib/api';

export default function SignupScreen() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    height: '',
    weight: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (key: keyof typeof form, value: string) => {
    if (error) {
      setError(null);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignupSuccess = (result: KakaoLoginResponse) => {
    setAuthToken(result.accessToken);
    router.replace('/(tabs)/foodshot' as any);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.height || !form.weight) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    const heightValue = Number(form.height);
    const weightValue = Number(form.weight);

    if (!Number.isFinite(heightValue) || !Number.isFinite(weightValue)) {
      setError('키와 몸무게는 숫자로 입력해주세요.');
      return;
    }

    setLoading(true);

    try {
      const result = await emailSignup({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        height: Math.round(heightValue),
        weight: Math.round(weightValue),
      });

      handleSignupSuccess(result);
    } catch (signupError: any) {
      if (signupError?.message) {
        setError(signupError.message);
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>이메일로 회원가입</Text>
          <Text style={styles.subtitle}>기본 정보를 입력하고 닥터당을 시작하세요.</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="이름"
            placeholderTextColor="#A0A0A0"
            value={form.name}
            onChangeText={(text) => handleChange('name', text)}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="이메일"
            placeholderTextColor="#A0A0A0"
            value={form.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="비밀번호"
            placeholderTextColor="#A0A0A0"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
            secureTextEntry
            editable={!loading}
          />

          <View style={styles.horizontalFields}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="키 (cm)"
              placeholderTextColor="#A0A0A0"
              value={form.height}
              onChangeText={(text) => handleChange('height', text.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="몸무게 (kg)"
              placeholderTextColor="#A0A0A0"
              value={form.weight}
              onChangeText={(text) => handleChange('weight', text.replace(/[^0-9.]/g, ''))}
              keyboardType="numeric"
              editable={!loading}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>회원가입하기</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.backLink} onPress={goToLogin}>
          <Text style={styles.backLinkText}>이미 계정이 있으신가요? 로그인으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  form: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#111827',
    marginBottom: 12,
  },
  horizontalFields: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  backLinkText: {
    color: '#6B7280',
    fontSize: 14,
  },
});


