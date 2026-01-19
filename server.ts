/**
 * 簡易バックエンドサーバー for E2E Testing
 * 
 * Bun.serve を使用してリクエストを処理
 * データはインメモリで管理
 */

const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// インメモリデータストア
const db = {
    documents: [] as any[],
    prompts: [] as any[],
}

export default {
    port: 3001,
    fetch(req: Request) {
        const url = new URL(req.url)
        const method = req.method

        // CORS preflight
        if (method === 'OPTIONS') {
            return new Response(null, { headers: CORS_HEADERS })
        }

        // JSONレスポンスヘルパー
        const json = (data: any, status = 200) =>
            new Response(JSON.stringify(data), {
                status,
                headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
            })

        // 404
        const notFound = () => json({ error: 'Not Found' }, 404)

        console.log(`[API] ${method} ${url.pathname}`)

        // APIルート
        if (url.pathname.startsWith('/api/v2/')) {
            // 認証
            if (url.pathname === '/api/v2/authorization') {
                if (method === 'POST') {
                    return req.json().then((body: any) => {
                        // user1/pass1 チェック
                        if (body.username === 'wrong_user') {
                            return json({ error: 'Invalid credentials' }, 401)
                        }
                        return json({
                            access_token: 'mock_token_' + Date.now(),
                            token_type: 'bearer',
                            user: { id: 'u1', username: body.username || 'admin', scope: 'admin' }
                        })
                    })
                }
                if (method === 'DELETE') {
                    return json({ message: 'Logged out' })
                }
            }

            // ドキュメント一覧
            if (url.pathname === '/api/v2/documents' && method === 'GET') {
                return json({ documents: db.documents })
            }
            // ドキュメント作成
            if (url.pathname === '/api/v2/documents' && method === 'POST') {
                return req.json().then((body: any) => {
                    const id = crypto.randomUUID()
                    const newDoc = {
                        document_id: id,
                        user_id: 'u1',
                        ...body,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                    db.documents.push(newDoc)
                    return json({
                        message: 'Document created successfully',
                        inserted_document_id: id,
                        new_document: newDoc
                    })
                })
            }
            const docMatch = url.pathname.match(/\/api\/v2\/documents\/([\w-]+)$/)
            if (docMatch) {
                const id = docMatch[1]
                if (method === 'PUT') {
                    return req.json().then((body: any) => {
                        const index = db.documents.findIndex(d => d.document_id === id)
                        if (index === -1) return notFound()
                        db.documents[index] = { ...db.documents[index], ...body, updated_at: new Date().toISOString() }
                        // Frontend update expects: { message, updated_document_id }
                        return json({
                            message: 'Document updated successfully',
                            updated_document_id: id
                        })
                    })
                }
                if (method === 'DELETE') {
                    const index = db.documents.findIndex(d => d.document_id === id)
                    if (index === -1) return notFound()
                    db.documents.splice(index, 1)
                    return json({ message: 'Deleted' })
                }
            }

            // プロンプト一覧
            if (url.pathname === '/api/v2/prompts' && method === 'GET') {
                return json({ prompts: db.prompts })
            }
            // プロンプト作成
            if (url.pathname === '/api/v2/prompts' && method === 'POST') {
                return req.json().then((body: any) => {
                    const id = crypto.randomUUID()
                    const newPrompt = {
                        prompt_id: id,
                        user_id: 'u1',
                        ...body,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }
                    db.prompts.push(newPrompt)
                    return json({
                        message: 'Prompt created successfully',
                        inserted_prompt_id: id,
                        new_prompt: newPrompt
                    })
                })
            }
            const promptMatch = url.pathname.match(/\/api\/v2\/prompts\/([\w-]+)$/)
            if (promptMatch) {
                const id = promptMatch[1]
                if (method === 'PUT') {
                    return req.json().then((body: any) => {
                        const index = db.prompts.findIndex(p => p.prompt_id === id)
                        if (index === -1) return notFound()
                        db.prompts[index] = { ...db.prompts[index], ...body, updated_at: new Date().toISOString() }
                        return json({
                            message: 'Prompt updated successfully',
                            updated_prompt_id: id
                        })
                    })
                }
                if (method === 'DELETE') {
                    const index = db.prompts.findIndex(p => p.prompt_id === id)
                    if (index === -1) return notFound()
                    db.prompts.splice(index, 1)
                    return json({ message: 'Deleted' })
                }
            }

            // 生成
            if (url.pathname.includes('/generation')) {
                return json({
                    result: 'これはモックサーバーによって生成されたテスト用テキストです。'
                })
            }
        }

        return notFound()
    },
}
