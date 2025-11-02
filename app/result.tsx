import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// @ts-ignore
import Svg, { Polygon, Text as SvgText } from 'react-native-svg';

export default function ResultScreen() {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  // 샘플 데이터
  const nutritionData = {
    carbs: 102,
    protein: 30,
    fat: 20,
  };

  const radarScores = {
    calories: 84,
    fat: 79,
    sodium: 81,
    sugar: 89,
    ratio: 35,
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      {/* 헤더 */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <View style={styles.cameraLens}>
              <View style={styles.appleIcon} />
            </View>
          </View>
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Dr. DANG</Text>
          <Text style={styles.headerSubtitle}>사진 한 장으로, 당뇨 케어</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 음식 이미지 */}
        <View style={styles.imageContainer}>
          <View style={styles.foodImagePlaceholder}>
            <Text style={styles.foodImageLabel}>오늘의 메뉴 : 고기국수</Text>
          </View>
        </View>

        {/* 영양 정보 카드 */}
        <View style={styles.card}>
          {/* 경고 */}
          <View style={styles.warningContainer}>
            <Text style={styles.warningIcon}>▲</Text>
            <View style={styles.warningTextContainer}>
              <Text style={styles.warningText}>혈당이 40~70mg/dL 이상</Text>
              <Text style={styles.warningText}>상승할 수 있어요!</Text>
            </View>
          </View>

          {/* 추천 */}
          <View style={styles.recommendationContainer}>
            <Text style={styles.recommendationText}>
              혈당 스파이크 예방을 위해{'\n'}
              채소 → 단백질 → 지방 → 탄수화물 순서의{'\n'}
              식사 방법을 추천드려요.
            </Text>
          </View>

          {/* 영양정보 */}
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>영양정보</Text>
            <View style={styles.nutritionTags}>
              <View style={[styles.tag, styles.tagRed]}>
                <Text style={styles.tagText}>탄수화물 {nutritionData.carbs}g</Text>
              </View>
              <View style={[styles.tag, styles.tagPink]}>
                <Text style={styles.tagText}>단백질 {nutritionData.protein}g</Text>
              </View>
              <View style={[styles.tag, styles.tagBlue]}>
                <Text style={styles.tagText}>지방 {nutritionData.fat}g</Text>
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
              <Text style={styles.ratioText}>탄단지 비율</Text>
              <Text style={styles.ratioScore}>{radarScores.ratio}점</Text>

              {/* 레이더 차트 */}
              <View style={styles.radarContainer}>
                <Svg width={300} height={300} viewBox="0 0 300 300">
                  {/* 외곽 펜타곤 */}
                  <Polygon
                    points="150,50 250,120 200,250 100,250 50,120"
                    fill="none"
                    stroke="#333"
                    strokeWidth="2"
                  />
                  {/* 내부 펜타곤 - 점수를 0-100 기준으로 계산 */}
                  <Polygon
                    points={`150,${50 + (100 - radarScores.calories) * 1.0} ${150 + (radarScores.fat - 50) * 1.0},${120 + (radarScores.fat - 50) * 0.5} ${200 - (100 - radarScores.sodium) * 1.0},${250 - (100 - radarScores.sodium) * 1.0} ${100 + (100 - radarScores.sugar) * 0.5},${250 - (100 - radarScores.sugar) * 1.0} ${50 + (100 - radarScores.ratio) * 0.5},${120 - (100 - radarScores.ratio) * 0.5}`}
                    fill="rgba(255, 107, 53, 0.3)"
                    stroke="#FF6B35"
                    strokeWidth="2"
                  />
                  {/* 점수 라벨 */}
                  <SvgText x="150" y="40" fontSize="14" fill="#FF6B35" textAnchor="middle">
                    열량 {radarScores.calories}점
                  </SvgText>
                  <SvgText x="260" y="125" fontSize="14" fill="#FF6B35" textAnchor="middle">
                    지방 {radarScores.fat}점
                  </SvgText>
                  <SvgText x="210" y="260" fontSize="14" fill="#FF6B35" textAnchor="middle">
                    나트륨 {radarScores.sodium}점
                  </SvgText>
                  <SvgText x="40" y="175" fontSize="14" fill="#FF6B35" textAnchor="middle">
                    당 {radarScores.sugar}점
                  </SvgText>
                </Svg>
              </View>

              {/* 경고 박스 */}
              <View style={styles.warningBox}>
                <Text style={styles.warningBoxText}>탄단지 비율이 나빠요</Text>
                <Text style={styles.warningBoxText}>포화지방이 높아요</Text>
                <Text style={styles.warningBoxText}>당이 약간 높아요</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
  logoCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3B30',
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
  foodImagePlaceholder: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    justifyContent: 'flex-end',
    padding: 16,
  },
  foodImageLabel: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    fontSize: 14,
    color: '#333333',
    alignSelf: 'center',
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
    marginBottom: 12,
  },
  ratioText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  ratioScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 20,
  },
  radarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  warningBox: {
    backgroundColor: '#FFE5F0',
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  warningBoxText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 8,
  },
});

