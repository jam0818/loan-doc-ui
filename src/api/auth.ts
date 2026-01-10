/**
 * 認証APIサービス
 */
import { apiRequest, setAuthToken } from './client'
import type { UserModel, AuthorizationApiResponse } from '@/types'

/**
 * ログイン
 */
export async function login(
    credentials: UserModel
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
export function logout(): void {
    setAuthToken(null)
}
