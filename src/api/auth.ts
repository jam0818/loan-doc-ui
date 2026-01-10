import type { AuthorizationApiResponse, UserModel } from '@/types'
/**
 * 認証APIサービス
 */
import { apiRequest, setAuthToken } from './client'

/**
 * ログイン
 */
export async function login (
  credentials: UserModel,
): Promise<AuthorizationApiResponse> {
  const response = await apiRequest<AuthorizationApiResponse>('/authorization', {
    method: 'POST',
    body: credentials,
  })
  // トークンを保存
  setAuthToken(response.token)
  return response
}

/**
 * ログアウト（トークンをクリア）
 */
export function logout (): void {
  setAuthToken(null)
}
