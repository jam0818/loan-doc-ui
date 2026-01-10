import type {
  GetPromptListApiResponse,
  PromptCreate,
  PromptCreateResponse,
  PromptDeleteResponse,
  PromptModel,
  PromptUpdate,
  PromptUpdateResponse,
} from '@/types'
/**
 * プロンプトAPIサービス
 */
import { apiRequest } from './client'

/**
 * プロンプト一覧を取得
 */
export async function fetchPrompts (): Promise<PromptModel[]> {
  const response = await apiRequest<GetPromptListApiResponse>('/prompts')
  return response.prompts
}

/**
 * プロンプトを作成
 */
export async function createPrompt (
  data: PromptCreate,
): Promise<PromptCreateResponse> {
  return apiRequest<PromptCreateResponse>('/prompts', {
    method: 'POST',
    body: data,
  })
}

/**
 * プロンプトを更新
 */
export async function updatePrompt (
  promptId: string,
  data: PromptUpdate,
): Promise<PromptUpdateResponse> {
  return apiRequest<PromptUpdateResponse>(`/prompts/${promptId}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * プロンプトを削除
 */
export async function deletePrompt (
  promptId: string,
): Promise<PromptDeleteResponse> {
  return apiRequest<PromptDeleteResponse>(`/prompts/${promptId}`, {
    method: 'DELETE',
  })
}
