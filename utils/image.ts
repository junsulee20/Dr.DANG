import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * 이미지 URI를 base64로 변환
 * @param imageUri 이미지 URI (로컬 파일 경로)
 * @returns base64 인코딩된 이미지 데이터 (data:image/jpeg;base64,... 형식)
 */
export async function imageUriToBase64(imageUri: string): Promise<string> {
  try {
    console.log('이미지 URI 변환 시도:', imageUri, 'Platform:', Platform.OS);

    let base64: string;
    let mimeType = 'image/jpeg';

    // 웹 환경에서는 fetch를 사용
    if (Platform.OS === 'web' || imageUri.startsWith('blob:') || imageUri.startsWith('http://') || imageUri.startsWith('https://')) {
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      // blob을 base64로 변환
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          // data:image/jpeg;base64,... 형식이면 그대로 사용
          if (result.startsWith('data:')) {
            console.log('이미지 변환 성공 (웹), 크기:', result.length);
            resolve(result);
          } else {
            // base64 문자열만 있으면 MIME 타입 추가
            const mime = blob.type || 'image/jpeg';
            const finalResult = `data:${mime};base64,${result}`;
            console.log('이미지 변환 성공 (웹), 크기:', finalResult.length);
            resolve(finalResult);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }

    // 네이티브 환경에서는 expo-file-system 사용
    try {
      base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
    } catch (fsError: any) {
      // file:// 프로토콜 제거 후 재시도
      if (imageUri.startsWith('file://')) {
        const normalizedUri = imageUri.replace('file://', '');
        try {
          base64 = await FileSystem.readAsStringAsync(normalizedUri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch (normalizedError: any) {
          throw new Error(`FileSystem 읽기 실패: ${fsError.message}, 정규화 후 재시도 실패: ${normalizedError.message}`);
        }
      } else {
        throw new Error(`FileSystem 읽기 실패: ${fsError.message}`);
      }
    }

    if (!base64) {
      throw new Error('base64 변환 결과가 비어있습니다.');
    }

    // MIME 타입 최종 확인
    const lowerUri = imageUri.toLowerCase();
    if (mimeType === 'image/jpeg') {
      if (lowerUri.includes('png')) {
        mimeType = 'image/png';
      } else if (lowerUri.includes('webp')) {
        mimeType = 'image/webp';
      }
    }

    // OpenAI Vision API 형식으로 반환
    const result = `data:${mimeType};base64,${base64}`;
    console.log('이미지 변환 성공, 크기:', result.length);
    return result;
  } catch (error: any) {
    console.error('이미지 변환 실패 상세:', {
      error: error.message,
      stack: error.stack,
      imageUri: imageUri,
      platform: Platform.OS,
    });
    throw new Error(`이미지를 base64로 변환하는데 실패했습니다: ${error.message}`);
  }
}

