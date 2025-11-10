import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeFoodImage, setAuthToken, getAuthToken } from '@/lib/api';

/**
 * API 테스트 화면
 * 백엔드 API 연동을 테스트하기 위한 화면
 */
export default function ApiTestScreen() {
  const [token, setToken] = useState('');
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  // 헬스체크 테스트
  const testHealthCheck = async () => {
    setLoading(true);
    setTestResult('헬스체크 테스트 중...');
    
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      setTestResult(`✅ 헬스체크 성공!\n\n${JSON.stringify(data, null, 2)}`);
    } catch (error: any) {
      setTestResult(`❌ 헬스체크 실패!\n\n${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 토큰 저장
  const saveToken = () => {
    if (!token.trim()) {
      Alert.alert('오류', '토큰을 입력해주세요');
      return;
    }
    setAuthToken(token.trim());
    Alert.alert('성공', '토큰이 저장되었습니다');
  };

  // 음식 분석 테스트
  const testFoodAnalysis = async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      Alert.alert('오류', '먼저 JWT 토큰을 입력하고 저장해주세요');
      return;
    }

    // 이미지 선택
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('오류', '갤러리 접근 권한이 필요합니다');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) {
      return;
    }

    setLoading(true);
    setTestResult('음식 분석 중... (30초 정도 걸릴 수 있습니다)');

    try {
      const analysisResult = await analyzeFoodImage(result.assets[0].uri);
      setTestResult(`✅ 음식 분석 성공!\n\n음식명: ${analysisResult.foodName}\n예상 혈당 상승: ${analysisResult.expectedGlucoseRise}mg/dL\n\n영양 정보:\n- 탄수화물: ${analysisResult.nutrition.carbs}g\n- 단백질: ${analysisResult.nutrition.protein}g\n- 지방: ${analysisResult.nutrition.fat}g\n\n추천사항:\n${analysisResult.recommendations.join('\n')}`);
    } catch (error: any) {
      setTestResult(`❌ 음식 분석 실패!\n\n에러 코드: ${error.code}\n메시지: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Swagger UI 열기
  const openSwaggerUI = () => {
    Alert.alert(
      'Swagger UI',
      'http://localhost:3001/api-docs/\n\n위 주소를 브라우저에서 열어주세요'
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>🧪 API 테스트</Text>
        <Text style={styles.subtitle}>백엔드 API 연동 테스트</Text>

        {/* 서버 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📡 백엔드 서버</Text>
          <Text style={styles.infoText}>http://localhost:3001</Text>
          <Text style={styles.infoText}>Swagger UI: http://localhost:3001/api-docs/</Text>
        </View>

        {/* 헬스체크 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1️⃣ 헬스체크</Text>
          <Text style={styles.description}>백엔드 서버가 실행 중인지 확인합니다</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testHealthCheck}
            disabled={loading}
          >
            <Text style={styles.buttonText}>헬스체크 실행</Text>
          </TouchableOpacity>
        </View>

        {/* JWT 토큰 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2️⃣ JWT 토큰 설정</Text>
          <Text style={styles.description}>
            Swagger UI에서 카카오 로그인 후 받은 accessToken을 입력하세요
          </Text>
          <TextInput
            style={styles.input}
            value={token}
            onChangeText={setToken}
            placeholder="JWT 토큰을 입력하세요"
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={styles.button}
            onPress={saveToken}
          >
            <Text style={styles.buttonText}>토큰 저장</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={openSwaggerUI}
          >
            <Text style={styles.buttonText}>Swagger UI 열기</Text>
          </TouchableOpacity>
        </View>

        {/* 음식 분석 테스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3️⃣ 음식 분석 테스트</Text>
          <Text style={styles.description}>
            음식 사진을 선택하여 GPT-4 Vision으로 분석합니다
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={testFoodAnalysis}
            disabled={loading}
          >
            <Text style={styles.buttonText}>음식 사진 분석</Text>
          </TouchableOpacity>
        </View>

        {/* 테스트 결과 */}
        {testResult ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📊 테스트 결과</Text>
            <View style={styles.resultBox}>
              <Text style={styles.resultText}>{testResult}</Text>
            </View>
          </View>
        ) : null}

        {/* 안내 사항 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ 테스트 순서</Text>
          <Text style={styles.infoText}>
            1. 백엔드 서버가 실행 중인지 확인 (헬스체크){'\n'}
            2. Swagger UI에서 카카오 로그인 테스트{'\n'}
            3. 받은 JWT 토큰을 여기에 입력 및 저장{'\n'}
            4. 음식 사진 분석 테스트{'\n'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
    marginVertical: 4,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  resultBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 13,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'monospace',
  },
});

