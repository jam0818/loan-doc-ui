/**
 * APIクライアント
 * 認証トークン管理とHTTPリクエストラッパーを提供
 */

// ベースURL（開発環境ではプロキシ経由を想定）
const BASE_URL = '/api/v2'

// 認証トークン（ログイン後に設定される）
let authToken: string | null = null

/**
 * 認証トークンを設定
 */
export function setAuthToken(token: string | null): void {
    authToken = token
}

/**
 * 認証トークンを取得
 */
export function getAuthToken(): string | null {
    return authToken
}

/**
 * APIリクエストオプション
 */
interface RequestOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
    headers?: Record<string, string>
}

/**
 * APIリクエストを実行
 * @param endpoint エンドポイント（/api/v2 以降のパス）
 * @param options リクエストオプション
 * @returns レスポンスデータ
 */
export async function apiRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
): Promise<T> {
    const { method = 'GET', body, headers = {} } = options

    const requestHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        ...headers,
    }

    // 認証トークンがあればヘッダーに追加
    if (authToken) {
        requestHeaders['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
    })

    // エラーレスポンスの処理
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
            response.status,
            errorData.message || `HTTP ${response.status}`,
            errorData
        )
    }

    // 空レスポンスの場合
    const text = await response.text()
    if (!text) {
        return {} as T
    }

    return JSON.parse(text) as T
}

/**
 * APIエラークラス
 */
export class ApiError extends Error {
    constructor(
        public status: number,
        message: string,
        public data?: unknown
    ) {
        super(message)
        this.name = 'ApiError'
    }
}
