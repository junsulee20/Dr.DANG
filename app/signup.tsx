import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Modal,
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
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleChange = (key: keyof typeof form, value: string) => {
    if (error) {
      setError(null);
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignupSuccess = async (result: KakaoLoginResponse) => {
    await setAuthToken(result.accessToken);
    router.replace('/(tabs)/foodshot' as any);
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.height || !form.weight) {
      setError('모든 항목을 입력해주세요.');
      return;
    }

    if (!privacyAgreed) {
      setError('개인정보 수집에 동의해주세요.');
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

      await handleSignupSuccess(result);
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
            style={styles.checkboxContainer}
            onPress={() => setShowPrivacyModal(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, privacyAgreed && styles.checkboxChecked]}>
              {privacyAgreed && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>개인정보 수집에 동의합니다.</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.submitButton,
              (loading || !privacyAgreed) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading || !privacyAgreed}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>회원가입하기</Text>
            )}
          </TouchableOpacity>
        </View>

        <Modal
          visible={showPrivacyModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowPrivacyModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>개인정보 수집 및 이용 동의</Text>
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={true}>
                <Text style={styles.modalText}>
                  닥터당은 회원님께 더 나은 서비스를 제공하기 위해 최소한의 개인정보만 수집하고 있습니다.
                  {'\n\n'}
                  <Text style={styles.modalBoldText}>수집하는 정보</Text>
                  {'\n'}
                  • 이름, 이메일, 비밀번호 (계정 관리용)
                  {'\n'}
                  • 키, 몸무게 (당뇨 관리 서비스 제공용)
                  {'\n'}
                  • 식사 사진 및 분석 결과 (개인 맞춤 건강 정보 제공용)
                  {'\n\n'}
                  <Text style={styles.modalBoldText}>이용 목적</Text>
                  {'\n'}
                  수집한 정보는 오로지 회원님께 제공하는 서비스의 질을 향상시키기 위해서만 사용됩니다.
                  {'\n\n'}
                  • 개인 맞춤 당뇨 관리 정보 제공
                  {'\n'}
                  • 식사 분석 및 건강 상태 추적
                  {'\n'}
                  • 서비스 개선 및 고객 지원
                  {'\n\n'}
                  회원님의 개인정보는 안전하게 보호되며, 서비스 제공 외의 목적으로는 절대 사용되지 않습니다.
                </Text>
              </ScrollView>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonCancel]}
                  onPress={() => {
                    setShowPrivacyModal(false);
                    setPrivacyAgreed(false);
                  }}
                >
                  <Text style={styles.modalButtonCancelText}>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonConfirm]}
                  onPress={() => {
                    setPrivacyAgreed(true);
                    setShowPrivacyModal(false);
                    if (error) setError(null);
                  }}
                >
                  <Text style={styles.modalButtonConfirmText}>동의합니다</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: 300,
    marginBottom: 20,
  },
  modalText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
  },
  modalBoldText: {
    fontWeight: 'bold',
    color: '#111827',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonConfirm: {
    backgroundColor: '#111827',
  },
  modalButtonCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalButtonConfirmText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


