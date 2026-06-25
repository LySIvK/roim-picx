import { Hono } from 'hono'
import { Ok, Fail, Folder } from '../type'
import { auth, type AppEnv } from '../middleware/auth'
import type { User } from '../type'

const folderRoutes = new Hono<AppEnv>()

// 创建目录
folderRoutes.post("/folder", auth, async (c) => {
    try {
        const user = c.get('user') as User | undefined
        const data = await c.req.json<Folder>()
        // Allow letters, numbers, underscores, hyphens and Chinese
        const regx = /^[A-Za-z0-9_-一-龥]+$/
        if (!data.name || !regx.test(data.name)) {
            return c.json(Fail("Folder name error: only letters, numbers, underscores, hyphens and Chinese allowed"))
        }

        // Calculate full path: join delimiter (current path context) with folder name
        const delimiter = data.delimiter && data.delimiter !== '/' ? data.delimiter.replace(/\/$/, '') : ''
        const folderPath = delimiter ? `${delimiter}/${data.name}/` : `${data.name}/`

        // Write to R2 for backward compatibility (zero-byte folder marker)
        await c.env.PICX.put(folderPath, null)

        // Write to D1 folders table
        const login = user?.login || 'system'
        await c.env.DB.prepare(
            `INSERT OR IGNORE INTO folders (name, path, user_id, user_login) VALUES (?, ?, ?, ?)`
        ).bind(data.name, folderPath, user?.id || null, login).run()

        return c.json(Ok("Success"))
    } catch (e) {
        console.error('Create folder error:', e)
        return c.json(Fail(`Create folder fail: ${(e as Error).message}`))
    }
})

// 删除目录
folderRoutes.delete("/folder", auth, async (c) => {
    try {
        const user = c.get('user') as User | undefined
        const data = await c.req.json<{ name: string }>()
        if (!data.name) {
            return c.json(Fail("Folder name required"))
        }

        const folderPath = data.name.endsWith('/') ? data.name : data.name + '/'
        const login = user?.login

        if (!login) {
            return c.json(Fail("Not authorized"))
        }

        // Delete from D1 folders table (only if it belongs to the user, or user is admin)
        const userRole = user?.role
        const isAdmin = userRole === 'admin'

        if (isAdmin) {
            await c.env.DB.prepare(
                `DELETE FROM folders WHERE path = ?`
            ).bind(folderPath).run()
        } else {
            await c.env.DB.prepare(
                `DELETE FROM folders WHERE path = ? AND user_login = ?`
            ).bind(folderPath, login).run()
        }

        // Delete R2 folder marker
        try {
            await c.env.PICX.delete(folderPath)
        } catch (r2Err) {
            // R2 delete failure is non-fatal — the folder marker might not exist
            console.warn('Failed to delete R2 folder marker:', r2Err)
        }

        // Note: if images exist with this folder path, they keep the folder
        // visible via the UNION query in images.ts

        return c.json(Ok(`Folder deleted: ${data.name}`))
    } catch (e) {
        console.error('Delete folder error:', e)
        return c.json(Fail(`Delete folder fail: ${(e as Error).message}`))
    }
})

export default folderRoutes
