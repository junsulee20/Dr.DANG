import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import { useFoodAnalysis } from '@/contexts/FoodAnalysisContext';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState, useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FoodshotScreen() {
  const router = useRouter();
  const { setImageUri, setImageBase64 } = useFoodAnalysis();
  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  // 화면에 포커스가 올 때마다 이미지 초기화
  useFocusEffect(
    useCallback(() => {
      console.log('🔵 푸드샷 화면 포커스 - 이미지 초기화');
      setLocalImageUri(null);
      setImageUri(null);
      setImageBase64(null);
    }, [setImageUri, setImageBase64])
  );

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('카메라 및 갤러리 접근 권한이 필요합니다.');
      return false;
    }
    return true;
  };

  const handleCamera = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const originalUri = asset.uri;
      
      // 이미지 최적화: 최대 1024x1024로 리사이징하고 quality 0.7로 압축
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1024 } }], // 비율 유지하며 최대 너비 1024px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        console.log('✅ 이미지 최적화 완료:', {
          원본: originalUri,
          최적화: manipulatedImage.uri,
          크기: manipulatedImage.width + 'x' + manipulatedImage.height
        });
        
        setLocalImageUri(manipulatedImage.uri);
        setImageUri(manipulatedImage.uri); // 최적화된 이미지 사용
        setImageBase64(null);
      } catch (error) {
        console.error('이미지 최적화 실패, 원본 사용:', error);
        // 최적화 실패 시 원본 사용
        setLocalImageUri(originalUri);
        setImageUri(originalUri);
        setImageBase64(null);
      }
    }
  };

  const handleGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const originalUri = asset.uri;
      
      // 이미지 최적화: 최대 1024x1024로 리사이징하고 quality 0.7로 압축
      try {
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          originalUri,
          [{ resize: { width: 1024 } }], // 비율 유지하며 최대 너비 1024px
          { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
        );
        
        console.log('✅ 이미지 최적화 완료:', {
          원본: originalUri,
          최적화: manipulatedImage.uri,
          크기: manipulatedImage.width + 'x' + manipulatedImage.height
        });
        
        setLocalImageUri(manipulatedImage.uri);
        setImageUri(manipulatedImage.uri); // 최적화된 이미지 사용
        setImageBase64(null);
      } catch (error) {
        console.error('이미지 최적화 실패, 원본 사용:', error);
        // 최적화 실패 시 원본 사용
        setLocalImageUri(originalUri);
        setImageUri(originalUri);
        setImageBase64(null);
      }
    }
  };

  const handleAnalyze = () => {
    if (localImageUri) {
      console.log('🔵 분석 시작 - loading 화면으로 이동');
      router.push('/(tabs)/loading' as any);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <View style={styles.imageContainer}>
          {localImageUri ? (
            <Image source={{ uri: localImageUri }} style={styles.foodImage} />
          ) : (
            <>
              <View style={styles.cameraPlaceholder}>
                <Ionicons name="camera-outline" size={80} color="#CCCCCC" />
              </View>
              <View style={styles.instructionContainer}>
                <Text style={styles.instructionText}>음식 이미지를 촬영하거나 선택하세요</Text>
                <Text style={styles.instructionSubtext}>
                  자동으로 혈당과 영양성분을 분석합니다.
                </Text>
              </View>
            </>
          )}
        </View>

        {/* 버튼 영역 */}
        {!localImageUri ? (
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={handleCamera}>
              <Ionicons name="camera" size={24} color="#FF3B30" />
              <Text style={styles.buttonText}>카메라</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleGallery}>
              <Ionicons name="images-outline" size={24} color="#FF3B30" />
              <Text style={styles.buttonText}>갤러리</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={() => setLocalImageUri(null)}
            >
              <Ionicons name="close-circle-outline" size={24} color="#666666" />
              <Text style={[styles.buttonText, styles.buttonTextSecondary]}>다시 선택</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.buttonPrimary]} 
              onPress={handleAnalyze}
            >
              <Ionicons name="analytics" size={24} color="#FFFFFF" />
              <Text style={[styles.buttonText, styles.buttonTextPrimary]}>분석하기</Text>
            </TouchableOpacity>
          </View>
        )}
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
  imageContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  cameraPlaceholder: {
    marginBottom: 24,
  },
  instructionContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  buttonPrimary: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonSecondary: {
    backgroundColor: '#F5F5F5',
    borderColor: '#CCCCCC',
  },
  buttonTextSecondary: {
    color: '#666666',
  },
});

