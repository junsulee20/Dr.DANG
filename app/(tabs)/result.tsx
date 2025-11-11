import { useRouter, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import { useFoodAnalysis } from '@/contexts/FoodAnalysisContext';
import { createMealRecord } from '@/lib/api';

export default function ResultScreen() {
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const { result } = useFoodAnalysis();

  useEffect(() => {
    if (!result) {
      console.log('🔴 분석 결과 없음 - 뒤로 이동');
      setTimeout(() => router.back(), 100);
    }
  }, [result, router]);

  if (!result) {
    return null;
  }

  const { step1, step2, imageUri, fullAnalysis } = result;

  // 화면 포커스 시 saved 초기화 및 최상단 스크롤
  useFocusEffect(
    useCallback(() => {
      console.log('🔵 결과 화면 포커스 - saved 초기화');
      setSaved(false);
      
      // 최상단으로 스크롤
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      }, 100);
    }, [])
  );

  // 저장 핸들러
  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('🔵 기록 저장 시작...');
      
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      await createMealRecord({
        date: today,
        mealType: selectedMealType,
        foodName: step1.foodName,
        imageUrl: fullAnalysis?.imageUrl || imageUri || '',
        analysisResult: fullAnalysis || {},
      });
      
      console.log('✅ 기록 저장 완료!');
      setSaved(true);
      setShowSaveModal(false);
    } catch (error: any) {
      console.error('❌ 저장 에러:', error);
      console.error('에러 메시지:', error.message);
      // 웹 환경에서는 콘솔에만 출력
    } finally {
      setSaving(false);
    }
  };


  // 경고 아이콘 색상
  const warningIconColor = step2.bloodSugarImpact.warning_icon === 'red' 
    ? '#FF3B30' 
    : step2.bloodSugarImpact.warning_icon === 'yellow'
    ? '#FFCC00'
    : '#34C759';

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

      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
      >
        {/* 음식 이미지 */}
        <View style={styles.imageContainer}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.foodImage} resizeMode="cover" />
          ) : (
            <View style={styles.foodImagePlaceholder}>
              <Text style={styles.foodImageLabel}>오늘의 메뉴 : {step1.foodName}</Text>
            </View>
          )}
          <View style={styles.foodImageOverlay}>
            <Text style={styles.foodImageLabel}>오늘의 메뉴 : {step1.foodName}</Text>
          </View>
        </View>

        {/* 영양 정보 카드 */}
        <View style={styles.card}>
          {/* 경고 */}
          <View style={styles.warningContainer}>
            <Text style={[styles.warningIcon, { color: warningIconColor }]}>▲</Text>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningText}>
                혈당 영향 점수: {step2.bloodSugarImpact.score}점
              </Text>
              <Text style={styles.warningDescription}>
                {step2.bloodSugarImpact.description}
              </Text>
            </View>
          </View>

          {/* 조언 */}
          <View style={styles.recommendationContainer}>
            {step2.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipType}>{tip.type}</Text>
                <Text style={styles.tipContent}>{tip.content}</Text>
              </View>
            ))}
          </View>

          {/* 영양정보 */}
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>영양정보</Text>
            <View style={styles.nutritionTags}>
              <View style={[styles.tag, styles.tagRed]}>
                <Text style={styles.tagText}>탄수화물 {step1.nutrients.carbohydrates}</Text>
              </View>
              <View style={[styles.tag, styles.tagPink]}>
                <Text style={styles.tagText}>단백질 {step1.nutrients.protein}</Text>
              </View>
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={styles.tagText}>지방 {step1.nutrients.fat}</Text>
              </View>
            </View>
          </View>

          {/* 상세 영양정보 */}
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.expandButtonText}>
              {isExpanded ? '접기 ↑↑↑' : '펼쳐서 상세 영양정보 확인하기 ↓↓↓'}
            </Text>
          </TouchableOpacity>

          {isExpanded && (
            <View style={styles.detailedNutrition}>
              <Text style={styles.detailedTitle}>상세 영양정보</Text>
              
              {/* 영양정보 표 */}
              <View style={styles.nutritionTable}>
                <View style={styles.tableRow}>
                  <Text style={styles.tableHeader}>영양소</Text>
                  <Text style={styles.tableHeader}>함량</Text>
                </View>
                <View style={[styles.tableRow, styles.tableRowEven]}>
                  <Text style={styles.tableLabel}>열량</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.totalCalories}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>탄수화물</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.carbohydrates}</Text>
                </View>
                <View style={[styles.tableRow, styles.tableRowEven]}>
                  <Text style={styles.tableLabel}>당</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.sugars}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>단백질</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.protein}</Text>
                </View>
                <View style={[styles.tableRow, styles.tableRowEven]}>
                  <Text style={styles.tableLabel}>지방</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.fat}</Text>
                </View>
                <View style={styles.tableRow}>
                  <Text style={styles.tableLabel}>나트륨</Text>
                  <Text style={styles.tableValue}>{step1.nutrients.sodium}</Text>
                </View>
                <View style={[styles.tableRow, styles.tableRowEven]}>
                  <Text style={styles.tableLabel}>추정 중량</Text>
                  <Text style={styles.tableValue}>{step1.estimatedWeight}</Text>
                </View>
              </View>

              {/* 영양정보 평가 */}
              {step2.nutritionSummary && (
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryTitle}>영양정보 평가</Text>
                  <Text style={styles.summaryText}>{step2.nutritionSummary}</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* 저장 버튼 */}
        <View style={styles.saveButtonContainer}>
          {saved ? (
            <View style={[styles.saveButton, styles.saveButtonSuccess]}>
              <Text style={styles.saveButtonText}>✓ 저장 완료!</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowSaveModal(true)}
            >
              <Text style={styles.saveButtonText}>📝 기록 저장하기</Text>
            </TouchableOpacity>
          )}
          
          {/* 다시하기 버튼 (항상 표시) */}
          <TouchableOpacity
            style={[styles.saveButton, styles.retryButton]}
            onPress={() => router.replace('/(tabs)/foodshot' as any)}
          >
            <Text style={[styles.saveButtonText, styles.retryButtonText]}>🔄 다시 촬영하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 저장 Modal */}
      <Modal
        visible={showSaveModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>식사 시간 선택</Text>
            <Text style={styles.modalSubtitle}>오늘 날짜로 저장됩니다</Text>

            {/* 식사 시간 선택 */}
            <View style={styles.mealTypeContainer}>
              {[
                { type: 'breakfast' as const, label: '🌅 아침' },
                { type: 'lunch' as const, label: '☀️ 점심' },
                { type: 'dinner' as const, label: '🌙 저녁' },
              ].map((meal) => (
                <TouchableOpacity
                  key={meal.type}
                  style={[
                    styles.mealTypeButton,
                    selectedMealType === meal.type && styles.mealTypeButtonSelected,
                  ]}
                  onPress={() => setSelectedMealType(meal.type)}
                >
                  <Text
                    style={[
                      styles.mealTypeText,
                      selectedMealType === meal.type && styles.mealTypeTextSelected,
                    ]}
                  >
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* 버튼 */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowSaveModal(false)}
                disabled={saving}
              >
                <Text style={styles.modalButtonTextCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>저장</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 250,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  foodImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodImageOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  foodImageLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  warningIcon: {
    fontSize: 20,
    color: '#000000',
    marginRight: 8,
  },
  warningTextContainer: {
    flex: 1,
  },
  warningText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  recommendationContainer: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  recommendationText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  tipItem: {
    marginBottom: 16,
  },
  tipType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 6,
  },
  tipContent: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 22,
  },
  nutritionSection: {
    marginBottom: 16,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  nutritionTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagRed: {
    backgroundColor: '#FFE5E5',
  },
  tagPink: {
    backgroundColor: '#FFE5F0',
  },
  tagBlue: {
    backgroundColor: '#E5F0FF',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  expandButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  detailedNutrition: {
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  detailedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  nutritionTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  tableRowEven: {
    backgroundColor: '#F9F9F9',
  },
  tableHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  tableLabel: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
  },
  tableValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'right',
  },
  summaryBox: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B35',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  saveButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButtonSuccess: {
    backgroundColor: '#34C759',
    shadowColor: '#34C759',
  },
  retryButton: {
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#FF6B35',
    shadowOpacity: 0.1,
    marginTop: 12,
  },
  retryButtonText: {
    color: '#FF6B35',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
    textAlign: 'center',
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  mealTypeButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  mealTypeButtonSelected: {
    backgroundColor: '#FFE5E5',
    borderColor: '#FF6B35',
  },
  mealTypeText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '600',
  },
  mealTypeTextSelected: {
    color: '#FF6B35',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F5F5F5',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
  },
  modalButtonSave: {
    backgroundColor: '#FF6B35',
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

