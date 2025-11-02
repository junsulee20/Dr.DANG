import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// @ts-ignore
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MealRecord {
  date: string;
  breakfast: string;
  lunch: string;
  dinner: string;
}

const sampleRecords: Record<string, MealRecord> = {
  '2025-11-02': {
    date: '2025-11-02',
    breakfast: '김밥',
    lunch: '콩국수',
    dinner: '김치찌개',
  },
  '2025-11-06': {
    date: '2025-11-06',
    breakfast: '계란후라이',
    lunch: '비빔밥',
    dinner: '삼겹살',
  },
};

export default function RecordScreen() {
  const [selectedDate, setSelectedDate] = useState('2025-11-21');
  const [currentMonth, setCurrentMonth] = useState('2025-11');

  const selectedRecord = sampleRecords[selectedDate];

  const markedDates: Record<string, any> = {};
  Object.keys(sampleRecords).forEach((date) => {
    markedDates[date] = {
      marked: true,
      dotColor: '#999999',
    };
  });
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: '#FF3B30',
  };

  const onMonthChange = (month: any) => {
    setCurrentMonth(month.dateString.substring(0, 7));
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
        {selectedRecord ? (
          <View style={styles.mealContainer}>
            <View style={styles.dateHeader}>
              <Text style={styles.dateText}>
                {selectedRecord.date.substring(5).replace('-', '/')} ({getDayOfWeek(selectedRecord.date)})
              </Text>
            </View>

            <TouchableOpacity style={styles.mealItem}>
              <Text style={styles.mealLabel}>아침 : {selectedRecord.breakfast}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mealItem}>
              <Text style={styles.mealLabel}>점심 : {selectedRecord.lunch}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.mealItem}>
              <Text style={styles.mealLabel}>저녁 : {selectedRecord.dinner}</Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>선택한 날짜에 기록이 없습니다.</Text>
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
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  mealLabel: {
    fontSize: 16,
    color: '#333333',
  },
  emptyContainer: {
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
});

