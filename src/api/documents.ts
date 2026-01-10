import type {
  DocumentCreate,
  DocumentCreateResponse,
  DocumentModel,
  DocumentUpdate,
  DocumentUpdateResponse,
  GetDocumentListApiResponse,
} from '@/types'
/**
 * ドキュメントAPIサービス
 */
import { apiRequest } from './client'

/**
 * ドキュメント一覧を取得
 */
export async function fetchDocuments (): Promise<DocumentModel[]> {
  const response = await apiRequest<GetDocumentListApiResponse>('/documents')
  return response.documents
}

/**
 * ドキュメントを作成
 */
export async function createDocument (
  data: DocumentCreate,
): Promise<DocumentCreateResponse> {
  return apiRequest<DocumentCreateResponse>('/documents', {
    method: 'POST',
    body: data,
  })
}

/**
 * ドキュメントを更新
 */
export async function updateDocument (
  documentId: string,
  data: DocumentUpdate,
): Promise<DocumentUpdateResponse> {
  return apiRequest<DocumentUpdateResponse>(`/documents/${documentId}`, {
    method: 'PUT',
    body: data,
  })
}

/**
 * ドキュメントを削除
 */
export async function deleteDocument (documentId: string): Promise<void> {
  await apiRequest(`/documents/${documentId}`, {
    method: 'DELETE',
  })
}
