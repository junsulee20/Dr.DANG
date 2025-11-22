import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getUserProfile, updateUserProfile, setAuthToken, UserProfile } from '@/lib/api';
import * as ImagePicker from 'expo-image-picker';

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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');

  // 프로필 로드
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      console.log('🔵 프로필 로드 시작...');
      const data = await getUserProfile();
      console.log('✅ 프로필 로드 성공:', data);
      setProfile(data);
      setEditName(data.name);
      setEditHeight(data.height?.toString() || '');
      setEditWeight(data.weight?.toString() || '');
    } catch (error: any) {
      console.error('❌ 프로필 로드 에러:', error);
      console.error('에러 코드:', error.code);
      console.error('에러 메시지:', error.message);
      
      // 401 에러면 로그인 페이지로 리다이렉트
      if (error.code === 'UNAUTHORIZED') {
        console.log('🔴 인증 만료 - 로그인 페이지로 이동');
        await setAuthToken(null); // 토큰 제거
        setTimeout(() => router.replace('/login' as any), 100);
      } else {
        console.log('🔴 기타 에러:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      await updateUserProfile({
        name: editName,
        height: editHeight ? parseInt(editHeight) : undefined,
        weight: editWeight ? parseInt(editWeight) : undefined,
      });
      
      await loadProfile();
      setEditing(false);
      console.log('✅ 프로필 수정 완료');
    } catch (error: any) {
      console.error('❌ 프로필 수정 에러:', error);
      console.error('에러 메시지:', error.message);
      // 웹 환경에서는 에러 메시지를 콘솔에만 출력
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfileImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      try {
        setLoading(true);
        await updateUserProfile({
          profileImageUri: result.assets[0].uri,
        });
        await loadProfile();
        console.log('✅ 프로필 이미지 변경 완료');
      } catch (error: any) {
        console.error('❌ 이미지 변경 에러:', error);
        console.error('에러 메시지:', error.message);
        // 웹 환경에서는 에러 메시지를 콘솔에만 출력
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = async () => {
    await setAuthToken(null);
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
        {loading && !profile ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>프로필 불러오는 중...</Text>
          </View>
        ) : profile ? (
          <View style={styles.profileCard}>
            <View style={styles.profileHeader}>
              <View style={styles.memberBadge}>
                <Text style={styles.memberBadgeText}>회원정보</Text>
              </View>
              {!editing && (
                <TouchableOpacity 
                  style={styles.editProfileButton}
                  onPress={() => setEditing(true)}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                  <Text style={styles.editProfileButtonText}>수정</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.profileContent}>
              <View style={styles.profileImageContainer}>
                {profile.profileImageUrl ? (
                  <Image source={{ uri: profile.profileImageUrl }} style={styles.profileImage} />
                ) : (
                  <View style={styles.profileImage}>
                    <Ionicons name="person" size={60} color="#CCCCCC" />
                  </View>
                )}
                <TouchableOpacity 
                  style={styles.editImageButton}
                  onPress={handleChangeProfileImage}
                  disabled={loading}
                >
                  <Ionicons name="create-outline" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.profileInfo}>
                {/* 이름 */}
                <View style={styles.profileRow}>
                  {editing ? (
                    <TextInput
                      style={styles.input}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="이름"
                    />
                  ) : (
                    <Text style={styles.profileName}>{profile.name}</Text>
                  )}
                </View>

                {/* 이메일 */}
                <View style={styles.profileRow}>
                  <Text style={styles.profileEmail}>{profile.email}</Text>
                </View>

                {/* 키 */}
                <View style={styles.profileRow}>
                  {editing ? (
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>키:</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={editHeight}
                        onChangeText={setEditHeight}
                        placeholder="175"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputUnit}>cm</Text>
                    </View>
                  ) : (
                    <Text style={styles.profileDetail}>
                      키: {profile.height ? `${profile.height}cm` : '미설정'}
                    </Text>
                  )}
                </View>

                {/* 몸무게 */}
                <View style={styles.profileRow}>
                  {editing ? (
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>몸무게:</Text>
                      <TextInput
                        style={styles.inputSmall}
                        value={editWeight}
                        onChangeText={setEditWeight}
                        placeholder="70"
                        keyboardType="numeric"
                      />
                      <Text style={styles.inputUnit}>kg</Text>
                    </View>
                  ) : (
                    <Text style={styles.profileDetail}>
                      몸무게: {profile.weight ? `${profile.weight}kg` : '미설정'}
                    </Text>
                  )}
                </View>

                {/* 수정 모드 버튼 */}
                {editing && (
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity
                      style={[styles.editActionButton, styles.cancelButton]}
                      onPress={() => {
                        setEditing(false);
                        setEditName(profile.name);
                        setEditHeight(profile.height?.toString() || '');
                        setEditWeight(profile.weight?.toString() || '');
                      }}
                      disabled={loading}
                    >
                      <Text style={styles.cancelButtonText}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.editActionButton, styles.saveButton]}
                      onPress={handleUpdateProfile}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <Text style={styles.saveButtonText}>저장</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : null}

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
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editProfileButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    minWidth: 60,
  },
  inputSmall: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#fff',
    width: 80,
    textAlign: 'center',
  },
  inputUnit: {
    fontSize: 14,
    color: '#666',
  },
  editButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

