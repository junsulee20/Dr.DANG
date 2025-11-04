import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoadingScreen() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 진행률 시뮬레이션
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            router.replace('/(tabs)/result' as any);
          }, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

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
            <Text style={styles.loadingText}>신뢰도 높은 결과를 위해</Text>
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

