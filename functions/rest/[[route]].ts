import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import { cors } from 'hono/cors'
import { Fail } from './type'
import type { AppEnv } from './middleware/auth'

// Import route modules
import authRoutes from './routes/auth'
import uploadRoutes from './routes/upload'
import imageRoutes from './routes/images'
import folderRoutes from './routes/folders'
import shareRoutes from './routes/share'
import albumRoutes from './routes/album'
import adminRoutes from './routes/admin'
import settingsRoutes from './routes/settings'
import apiKeyRoutes from './routes/api-keys'
// 导入 user 路由的处理函数
import { userMeHandler, userMeStatsHandler } from './routes/user'

const app = new Hono<AppEnv>().basePath('/rest')
app.use("*", cors())
// 注册明确的 user 路由（必须在 imageRoutes 的通配符路由之前）
app.get('/user/me', userMeHandler)
app.get('/user/me/stats', userMeStatsHandler)

// Register route modules
app.route('/', authRoutes)
app.route('/', uploadRoutes)
app.route('/', folderRoutes)
app.route('/', shareRoutes)
app.route('/', albumRoutes) // Albums
app.route('/admin', adminRoutes)  // 管理员和用户接口
app.route('/settings', settingsRoutes) // 系统设置接口
app.route('/', apiKeyRoutes) // API Keys
// Diagnostic: test D1 write from worker
app.get('/dbtest', async (c) => {
    try {
        const r = await c.env.DB.prepare(
            "INSERT INTO images (key, user_id, user_login, size, mime_type, folder, storage_type) VALUES ('diag_test', null, 'diag', 1, 'text/plain', '', 'R2')"
        ).run()
        return c.json({ ok: true, meta: r.meta })
    } catch (e: any) {
        return c.json({ ok: false, error: e.message, stack: e.stack })
    }
})

app.route('/', imageRoutes) // Must be last due to catch-all route

// Error handling
app.onError((err, c) => {
    console.error(`${err}`)
    return c.json(Fail(err.message), 500)
})

// Not found handling
app.notFound((c) => {
    return c.json(Fail('not found'), 404)
})

export const onRequest = handle(app)
export { app }
export type { AppEnv as Bindings }
