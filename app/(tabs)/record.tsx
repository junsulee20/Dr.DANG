import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect, useCallback } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
// @ts-ignore
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getMealRecords, MealRecord as ApiMealRecord } from '@/lib/api';
import { useRouter, useFocusEffect } from 'expo-router';
// @ts-ignore
import { useFoodAnalysis } from '@/contexts/FoodAnalysisContext';

export default function RecordScreen() {
  const router = useRouter();
  const { setResult } = useFoodAnalysis();
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentMonth, setCurrentMonth] = useState(today.substring(0, 7));
  const [monthRecords, setMonthRecords] = useState<ApiMealRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // 월별 데이터 로드
  useEffect(() => {
    loadMonthRecords();
  }, [currentMonth]);

  // 화면 포커스 시 데이터 새로고침
  useFocusEffect(
    useCallback(() => {
      console.log('🔵 기록 화면 포커스 - 데이터 새로고침');
      loadMonthRecords();
    }, [currentMonth])
  );

  const loadMonthRecords = async () => {
    try {
      setLoading(true);
      console.log('🔵 월별 기록 로드:', currentMonth);
      const data = await getMealRecords({ month: currentMonth });
      setMonthRecords(data.records || []);
      console.log('✅ 기록 로드 완료:', data.records?.length || 0, '개');
    } catch (error: any) {
      console.error('❌ 기록 로드 에러:', error);
      setMonthRecords([]);
    } finally {
      setLoading(false);
    }
  };

  // 선택한 날짜의 기록들
  const selectedDayRecords = monthRecords.filter(record => record.date === selectedDate);

  // 기록 클릭 핸들러 - 분석 결과 페이지로 이동
  const handleRecordClick = (record: ApiMealRecord) => {
    console.log('🔵 기록 클릭:', record.id);
    
    // 기록 데이터를 FoodAnalysisResult 형식으로 변환
    const analysisResult = {
      step1: {
        foodName: record.foodName,
        estimatedWeight: '1인분',
        nutrients: {
          totalCalories: `${record.detailedNutrition?.calories || 0}kcal`,
          carbohydrates: `${record.nutrition?.carbs || 0}g`,
          sugars: `${record.detailedNutrition?.sugar || 0}g`,
          protein: `${record.nutrition?.protein || 0}g`,
          fat: `${record.nutrition?.fat || 0}g`,
          sodium: `${record.detailedNutrition?.sodium || 0}mg`,
        },
      },
      step2: {
        bloodSugarImpact: {
          score: record.detailedNutrition?.ratio || 0,
          description: record.analysisResult?.warning || '혈당 영향 정보 없음',
          warning_icon: (record.expectedGlucoseRise || 0) >= 60 ? 'red' :
                       (record.expectedGlucoseRise || 0) >= 30 ? 'yellow' : 'green',
        },
        tips: (record.recommendations || []).map((rec: string, index: number) => ({
          type: ['양 조절', '보완 음식', '식사 순서'][index] || '기타',
          content: rec,
        })),
      },
      imageUri: record.imageUrl || '',
      fullAnalysis: {
        foodName: record.foodName,
        expectedGlucoseRise: record.expectedGlucoseRise || 0,
        actionGuide: record.recommendations || [],
        nutrition: record.nutrition || { carbs: 0, protein: 0, fat: 0 },
        detailedNutrition: record.detailedNutrition || { calories: 0, sugar: 0, sodium: 0, ratio: 0 },
        analysisResult: record.analysisResult || {},
        imageUrl: record.imageUrl || '',
      },
    };
    
    // Context에 결과 저장
    setResult(analysisResult);
    
    // 결과 페이지로 이동
    router.push('/(tabs)/result' as any);
  };

  // 캘린더 마킹 (실제 데이터 기반)
  const markedDates: Record<string, any> = {};
  
  // 기록이 있는 날짜에 점 표시
  const recordDates = new Set(monthRecords.map(record => record.date));
  recordDates.forEach((date) => {
    markedDates[date] = {
      marked: true,
      dotColor: '#FF6B35',
    };
  });
  
  // 선택한 날짜 강조
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#FF3B30',
  };

  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString.substring(0, 7));
  };

  // 식사 시간별 아이콘
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      default: return '🍽️';
    }
  };

  // 식사 시간 한글
  const getMealLabel = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '아침';
      case 'lunch': return '점심';
      case 'dinner': return '저녁';
      default: return '간식';
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 캘린더 */}
        <View style={styles.calendarContainer}>
          <Calendar
            current={currentMonth}
            onMonthChange={onMonthChange}
            markedDates={markedDates}
            onDayPress={(day: any) => setSelectedDate(day.dateString)}
            monthFormat={'yyyy년 MM월'}
            hideExtraDays={true}
            firstDay={0}
            theme={{
              calendarBackground: '#FFFFFF',
              textSectionTitleColor: '#666666',
              selectedDayBackgroundColor: '#FF3B30',
              selectedDayTextColor: '#FFFFFF',
              todayTextColor: '#FF3B30',
              dayTextColor: '#333333',
              textDisabledColor: '#CCCCCC',
              dotColor: '#999999',
              selectedDotColor: '#FFFFFF',
              arrowColor: '#333333',
              monthTextColor: '#333333',
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 12,
            }}
            style={styles.calendar}
          />
        </View>

        {/* 식단 목록 */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B35" />
            <Text style={styles.loadingText}>기록 불러오는 중...</Text>
          </View>
        ) : selectedDayRecords.length > 0 ? (
          <View style={styles.mealContainer}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>
                {selectedDate.substring(5).replace('-', '/')} ({getDayOfWeek(selectedDate)})
              </Text>
              <Text style={styles.dateSubtext}>
                {selectedDayRecords.length}개의 기록
              </Text>
            </View>

            {selectedDayRecords.map((record, index) => (
              <TouchableOpacity 
                key={record.id} 
                style={styles.mealItem}
                onPress={() => handleRecordClick(record)}
              >
                <View style={styles.mealItemLeft}>
                  <Text style={styles.mealIcon}>{getMealIcon(record.mealType)}</Text>
                  <View style={styles.mealTextContainer}>
                    <Text style={styles.mealLabel}>
                      {getMealLabel(record.mealType)} : {record.foodName}
                    </Text>
                    {record.nutrition && (
                      <Text style={styles.mealNutrition}>
                        탄 {record.nutrition.carbs}g · 단 {record.nutrition.protein}g · 지 {record.nutrition.fat}g
                      </Text>
                    )}
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>선택한 날짜에 기록이 없습니다.</Text>
            <Text style={styles.emptySubtext}>푸드샷에서 음식을 분석하고 저장해보세요!</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function getDayOfWeek(dateString: string): string {
  const date = new Date(dateString);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[date.getDay()];
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
  calendarContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  calendar: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  mealContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  dateHeader: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  dateSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 12,
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  mealItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  mealIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  mealTextContainer: {
    flex: 1,
  },
  mealLabel: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    marginBottom: 4,
  },
  mealNutrition: {
    fontSize: 12,
    color: '#666666',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});

