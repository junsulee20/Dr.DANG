import * as FileSystem from 'expo-file-system';
import { analyzeFoodImage } from '@/lib/apiClient';

/**
 * 로컬 이미지 URI를 백엔드로 업로드하고 분석
 */
export async function uploadAndAnalyzeImage(imageUri: string): Promise<any> {
  try {
    // 이미지 분석 API 호출
    const result = await analyzeFoodImage(imageUri);
    return result;
  } catch (error: any) {
    console.error('이미지 업로드 및 분석 오류:', error);
    throw error;
  }
}

/**
 * 이미지를 Base64로 변환 (필요한 경우)
 */
export async function imageToBase64(uri: string): Promise<string> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return base64;
  } catch (error) {
    console.error('Base64 변환 오류:', error);
    throw error;
  }
}

