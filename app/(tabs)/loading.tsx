import { useFoodAnalysis } from '@/contexts/FoodAnalysisContext';
import { analyzeFoodImage as analyzeFoodImageAPI } from '@/lib/api';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('이미지 분석 중...');
  const { imageUri, imageBase64, setResult } = useFoodAnalysis();

  useEffect(() => {
    if (!imageUri) {
      console.log('🔴 이미지 없음 - 뒤로 이동');
      setTimeout(() => router.back(), 100);
      return;
    }

    let progressInterval: NodeJS.Timeout;

    const analyzeFood = async () => {
      try {
        // 백엔드 API로 음식 분석
        setStatus('이미지 업로드 중...');
        setProgress(10);

        if (!imageUri) {
          throw new Error('이미지가 없습니다.');
        }

        console.log('🔵 백엔드 API로 음식 분석 시작...');
        console.log('🔵 이미지 URI:', imageUri);
        console.log('🔵 이미지 URI 타입:', typeof imageUri);
        console.log('🔵 이미지 URI 길이:', imageUri?.length);
        setProgress(30);
        setStatus('신뢰도 높은 결과를 위해');

        console.log('🔵 analyzeFoodImageAPI 호출 직전');
        // 백엔드 API 호출
        const analysisResult = await analyzeFoodImageAPI(imageUri);
        console.log('🔵 analyzeFoodImageAPI 호출 완료');
        
        console.log('✅ 분석 완료:', analysisResult);
        setProgress(80);
        setStatus('결과 처리 중...');

        // 결과를 Context 형식으로 변환
        setResult({
          step1: {
            foodName: analysisResult.foodName,
            estimatedWeight: '1인분',
            nutrients: {
              totalCalories: `${analysisResult.detailedNutrition.calories}kcal`,
              carbohydrates: `${analysisResult.nutrition.carbs}g`,
              sugars: `${analysisResult.detailedNutrition.sugar}g`,
              protein: `${analysisResult.nutrition.protein}g`,
              fat: `${analysisResult.nutrition.fat}g`,
              sodium: `${analysisResult.detailedNutrition.sodium}mg`,
            },
          },
          step2: {
            nutritionSummary: analysisResult.analysisResult?.nutritionSummary,
            bloodSugarImpact: {
              score: analysisResult.detailedNutrition.ratio,
              description: analysisResult.analysisResult.warning,
              warning_icon: analysisResult.expectedGlucoseRise >= 60 ? 'red' :
                           analysisResult.expectedGlucoseRise >= 30 ? 'yellow' : 'green',
            },
            tips: analysisResult.actionGuide.map((guide, index) => ({
              type: ['양 조절', '보완 음식', '식사 순서'][index] || '기타',
              content: guide,
            })),
          },
          imageUri: imageUri,
          fullAnalysis: analysisResult, // 전체 결과 저장
        });

        setProgress(100);
        setStatus('완료!');

        // 결과 화면으로 이동
        setTimeout(() => {
          router.replace('/(tabs)/result' as any);
        }, 500);
      } catch (error: any) {
        console.error('❌ 분석 에러 발생!');
        console.error('에러 객체:', error);
        console.error('에러 타입:', typeof error);
        console.error('에러 코드:', error?.code);
        console.error('에러 메시지:', error?.message);
        console.error('에러 상세:', error?.details);
        
        try {
          console.error('에러 전체 (JSON):', JSON.stringify(error, null, 2));
        } catch (e) {
          console.error('에러 JSON 변환 실패:', e);
        }
        
        // 에러 스택도 출력
        if (error?.stack) {
          console.error('에러 스택:', error.stack);
        }
        
        const errorMessage = error?.code && error?.message
          ? `[${error.code}] ${error.message}` 
          : error?.message || '음식 분석 중 오류가 발생했습니다.';
        
        console.log('🔴 에러 메시지:', errorMessage);
        console.log('🔴 1초 후 뒤로 이동...');
        
        // 웹에서는 Alert 대신 뒤로 가기
        setTimeout(() => {
          console.log('🔴 뒤로 이동 실행');
          router.back();
        }, 1000);
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

