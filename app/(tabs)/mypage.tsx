import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const menuItems = [
  { id: 1, title: '공지사항', icon: 'notifications-outline' },
  { id: 2, title: '자주 묻는 질문', icon: 'help-circle-outline' },
  { id: 3, title: '서비스 문의', icon: 'mail-outline' },
  { id: 4, title: '약관 및 정책', icon: 'document-text-outline' },
  { id: 5, title: '멤버쉽', icon: 'star-outline' },
  { id: 6, title: '로그아웃', icon: 'log-out-outline', isDestructive: true },
];

export default function MypageScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login' as any);
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
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.memberBadge}>
              <Text style={styles.memberBadgeText}>회원정보</Text>
            </View>
          </View>

          <View style={styles.profileContent}>
            <View style={styles.profileImageContainer}>
              <View style={styles.profileImage}>
                <Ionicons name="person" size={60} color="#CCCCCC" />
              </View>
              <TouchableOpacity style={styles.editImageButton}>
                <Ionicons name="create-outline" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.profileInfo}>
              <View style={styles.profileRow}>
                <Text style={styles.profileName}>닥터당</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileEmail}>drdang@gmail.com</Text>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileDetail}>키: 175cm</Text>
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={18} color="#007AFF" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileRow}>
                <Text style={styles.profileDetail}>몸무게: 65kg</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 메뉴 목록 */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={item.title === '로그아웃' ? handleLogout : undefined}>
              <Ionicons
                name={item.icon as any}
                size={24}
                color={item.isDestructive ? '#FF3B30' : '#333333'}
              />
              <Text
                style={[
                  styles.menuItemText,
                  item.isDestructive && styles.menuItemTextDestructive,
                ]}>
                {item.title}
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          ))}
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
  profileCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  memberBadge: {
    backgroundColor: '#CCCCCC',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  memberBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  profileContent: {
    flexDirection: 'row',
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },
  profileDetail: {
    fontSize: 14,
    color: '#666666',
    marginRight: 8,
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  menuItemTextDestructive: {
    color: '#FF3B30',
  },
});

