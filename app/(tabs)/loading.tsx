import { useFoodAnalysis } from '@/contexts/FoodAnalysisContext';
import { analyzeFoodImage, generateAdvice } from '@/lib/openai';
import { imageUriToBase64 } from '@/utils/image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('이미지 분석 중...');
  const { imageUri, imageBase64, setResult } = useFoodAnalysis();

  useEffect(() => {
    if (!imageUri) {
      Alert.alert('오류', '이미지를 찾을 수 없습니다.', [
        { text: '확인', onPress: () => router.back() },
      ]);
      return;
    }

    let progressInterval: NodeJS.Timeout;

    const analyzeFood = async () => {
      try {
        // Step 1: 이미지 분석
        setStatus('이미지 분석 중...');
        setProgress(10);

        // Context에 base64가 있으면 사용, 없으면 변환
        let finalBase64: string;
        if (imageBase64) {
          console.log('Context에서 base64 사용');
          finalBase64 = imageBase64;
        } else if (imageUri) {
          console.log('이미지 URI에서 base64 변환');
          finalBase64 = await imageUriToBase64(imageUri);
        } else {
          throw new Error('이미지 데이터가 없습니다.');
        }
        setProgress(30);

        const step1Result = await analyzeFoodImage(finalBase64);
        setProgress(50);
        setStatus('조언 생성 중...');

        // Step 2: 조언 생성
        const step2Result = await generateAdvice(step1Result);
        setProgress(80);

        // 결과 저장
        setResult({
          step1: step1Result,
          step2: step2Result,
          imageUri: imageUri,
        });

        setProgress(100);
        setStatus('완료!');

        // 결과 화면으로 이동
        setTimeout(() => {
          router.replace('/(tabs)/result' as any);
        }, 500);
      } catch (error: any) {
        console.error('분석 에러:', error);
        Alert.alert(
          '분석 실패',
          error.message || '음식 분석 중 오류가 발생했습니다.',
          [
            {
              text: '다시 시도',
              onPress: () => router.back(),
            },
            {
              text: '취소',
              style: 'cancel',
              onPress: () => router.back(),
            },
          ]
        );
      }
    };

    // 진행률 시뮬레이션 (실제 API 호출과 함께)
    progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          // API 완료 전까지는 95%까지만
          return prev;
        }
        return prev + 1;
      });
    }, 200);

    analyzeFood();

    return () => {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [imageUri, router, setResult]);

  const progressBlocks = 15;
  const filledBlocks = Math.floor((progress / 100) * progressBlocks);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Dr. DANG</Text>
          <Text style={styles.headerSubtitle}>사진 한 장으로, 당뇨 케어</Text>
        </View>
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        <View style={styles.imageOverlay}>
          <View style={styles.overlayContent}>
            <Text style={styles.hourglass}>⏳</Text>
            <Text style={styles.loadingTitle}>혈당 검사 중...</Text>
            <Text style={styles.loadingText}>{status}</Text>
            <Text style={styles.loadingText}>잠시만 기다려주세요😊</Text>
          </View>
        </View>

        {/* 진행률 표시 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>검사 진행률: {progress}%</Text>
          <View style={styles.progressBar}>
            {Array.from({ length: progressBlocks }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressBlock,
                  index < filledBlocks ? styles.progressBlockFilled : styles.progressBlockEmpty,
                ]}
              />
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  logoContainer: {
    marginRight: 12,
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageOverlay: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
    overflow: 'hidden',
  },
  overlayContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '90%',
  },
  hourglass: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
  progressContainer: {
    paddingBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  progressBlock: {
    width: 20,
    height: 8,
    borderRadius: 4,
  },
  progressBlockFilled: {
    backgroundColor: '#FF6B35',
  },
  progressBlockEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333333',
  },
});

