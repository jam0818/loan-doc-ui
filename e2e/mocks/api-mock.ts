import { type Page, type Route } from '@playwright/test'

/**
 * テスト用モックデータ
 */
export const mockData = {
    // モックドキュメント
    documents: [
        {
            document_id: '10000000-0000-0000-0000-000000000001',
            title: 'テストドキュメント1',
            field_items: [
                { field_id: '20000000-0000-0000-0000-000000000001', name: 'サマリー', content: 'サマリーの内容です' },
                { field_id: '20000000-0000-0000-0000-000000000002', name: '詳細', content: '詳細の内容です' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            document_id: '10000000-0000-0000-0000-000000000002',
            title: 'テストドキュメント2',
            field_items: [
                { field_id: '20000000-0000-0000-0000-000000000003', name: 'タイトル', content: 'タイトルの内容' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
        },
    ],

    // モックプロンプト
    prompts: [
        {
            prompt_id: '30000000-0000-0000-0000-000000000001',
            title: 'テストプロンプト1',
            prompt_target: 'all',
            field_prompt_items: [
                { field_id: null, generation_prompt: '生成プロンプト', revision_prompt: '修正プロンプト' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            prompt_id: '30000000-0000-0000-0000-000000000002',
            title: 'テストプロンプト2（個別）',
            prompt_target: 'each',
            field_prompt_items: [
                { field_id: '20000000-0000-0000-0000-000000000001', generation_prompt: 'サマリー生成', revision_prompt: 'サマリー修正' },
                { field_id: '20000000-0000-0000-0000-000000000002', generation_prompt: '詳細生成', revision_prompt: '詳細修正' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
        },
    ],

    // 認証トークン
    authToken: 'mock-test-token-12345',
}

/**
 * APIルートをモックする
 */
export async function setupApiMocks(page: Page): Promise<void> {
    // 認証API
    await page.route('**/api/v2/authorization', async (route: Route) => {
        const request = route.request()
        if (request.method() === 'POST') {
            const body = request.postDataJSON()
            // 有効な認証情報
            if (body.username === 'admin' && body.password === 'password') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ token: mockData.authToken }),
                })
            } else if (body.username === 'testuser') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ token: mockData.authToken }),
                })
            } else {
                // 無効な認証情報
                await route.fulfill({
                    status: 401,
                    contentType: 'application/json',
                    body: JSON.stringify({ message: 'ユーザー名またはパスワードが正しくありません' }),
                })
            }
        } else {
            await route.continue()
        }
    })

    // ドキュメント一覧API
    await page.route('**/api/v2/documents', async (route: Route) => {
        const request = route.request()
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ documents: mockData.documents }),
            })
        } else if (request.method() === 'POST') {
            // ドキュメント作成
            const body = request.postDataJSON()
            const newDoc = {
                document_id: `10000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
                title: body.title,
                field_items: body.field_items || [],
                shared_scope: 'private',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            mockData.documents.push(newDoc)
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ document: newDoc }),
            })
        } else {
            await route.continue()
        }
    })

    // ドキュメント個別操作API
    await page.route('**/api/v2/documents/*', async (route: Route) => {
        const request = route.request()
        const url = request.url()
        const documentId = url.split('/').pop()

        if (request.method() === 'PUT') {
            // 更新
            const body = request.postDataJSON()
            const index = mockData.documents.findIndex(d => d.document_id === documentId)
            if (index !== -1) {
                mockData.documents[index] = {
                    ...mockData.documents[index],
                    ...body,
                    updated_at: new Date().toISOString(),
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ document: mockData.documents[index] }),
                })
            } else {
                await route.fulfill({ status: 404 })
            }
        } else if (request.method() === 'DELETE') {
            // 削除
            const index = mockData.documents.findIndex(d => d.document_id === documentId)
            if (index !== -1) {
                mockData.documents.splice(index, 1)
                await route.fulfill({ status: 200, body: JSON.stringify({}) })
            } else {
                await route.fulfill({ status: 404 })
            }
        } else {
            await route.continue()
        }
    })

    // プロンプト一覧API
    await page.route('**/api/v2/prompts', async (route: Route) => {
        const request = route.request()
        if (request.method() === 'GET') {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ prompts: mockData.prompts }),
            })
        } else if (request.method() === 'POST') {
            // プロンプト作成
            const body = request.postDataJSON()
            const newPrompt = {
                prompt_id: `30000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
                title: body.title,
                prompt_target: body.prompt_target || 'all',
                field_prompt_items: body.field_prompt_items || [],
                shared_scope: 'private',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }
            mockData.prompts.push(newPrompt)
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ prompt: newPrompt }),
            })
        } else {
            await route.continue()
        }
    })

    // プロンプト個別操作API
    await page.route('**/api/v2/prompts/*', async (route: Route) => {
        const request = route.request()
        const url = request.url()
        const promptId = url.split('/').pop()

        if (request.method() === 'PUT') {
            const body = request.postDataJSON()
            const index = mockData.prompts.findIndex(p => p.prompt_id === promptId)
            if (index !== -1) {
                mockData.prompts[index] = {
                    ...mockData.prompts[index],
                    ...body,
                    updated_at: new Date().toISOString(),
                }
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ prompt: mockData.prompts[index] }),
                })
            } else {
                await route.fulfill({ status: 404 })
            }
        } else if (request.method() === 'DELETE') {
            const index = mockData.prompts.findIndex(p => p.prompt_id === promptId)
            if (index !== -1) {
                mockData.prompts.splice(index, 1)
                await route.fulfill({ status: 200, body: JSON.stringify({}) })
            } else {
                await route.fulfill({ status: 404 })
            }
        } else {
            await route.continue()
        }
    })

    // LLM生成API
    await page.route('**/api/v2/llm/generate', async (route: Route) => {
        // ストリーミングレスポンスをシミュレート
        await route.fulfill({
            status: 200,
            contentType: 'text/event-stream',
            body: 'data: {"content": "モック生成されたコンテンツです。"}\n\ndata: [DONE]\n\n',
        })
    })
}

/**
 * モックデータをリセット
 */
export function resetMockData(): void {
    mockData.documents = [
        {
            document_id: '10000000-0000-0000-0000-000000000001',
            title: 'テストドキュメント1',
            field_items: [
                { field_id: '20000000-0000-0000-0000-000000000001', name: 'サマリー', content: 'サマリーの内容です' },
                { field_id: '20000000-0000-0000-0000-000000000002', name: '詳細', content: '詳細の内容です' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            document_id: '10000000-0000-0000-0000-000000000002',
            title: 'テストドキュメント2',
            field_items: [
                { field_id: '20000000-0000-0000-0000-000000000003', name: 'タイトル', content: 'タイトルの内容' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
        },
    ]

    mockData.prompts = [
        {
            prompt_id: '30000000-0000-0000-0000-000000000001',
            title: 'テストプロンプト1',
            prompt_target: 'all',
            field_prompt_items: [
                { field_id: null, generation_prompt: '生成プロンプト', revision_prompt: '修正プロンプト' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
        },
        {
            prompt_id: '30000000-0000-0000-0000-000000000002',
            title: 'テストプロンプト2（個別）',
            prompt_target: 'each',
            field_prompt_items: [
                { field_id: '20000000-0000-0000-0000-000000000001', generation_prompt: 'サマリー生成', revision_prompt: 'サマリー修正' },
                { field_id: '20000000-0000-0000-0000-000000000002', generation_prompt: '詳細生成', revision_prompt: '詳細修正' },
            ],
            shared_scope: 'private',
            created_at: '2024-01-02T00:00:00Z',
            updated_at: '2024-01-02T00:00:00Z',
        },
    ]
}
