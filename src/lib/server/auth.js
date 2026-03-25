import { db } from '$lib/server/db'
import { sessionsTable, usersTable } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'

const SESSION_COOKIE = 'session'
const SESSION_DURATION_DAYS = 30

/**
 * Creates a new session for the given user and sets the cookie on the response.
 */
export async function createSession(cookies, userId) {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + SESSION_DURATION_DAYS)

    await db.insert(sessionsTable).values({
        id: sessionId,
        user_id: userId,
        expires_at: expiresAt.toISOString(),
    })

    cookies.set(SESSION_COOKIE, sessionId, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        expires: expiresAt,
    })
}

/**
 * Returns the user for the current session, or null if not authenticated.
 */
export async function getUser(cookies) {
    const sessionId = cookies.get(SESSION_COOKIE)
    if (!sessionId) return null

    const rows = await db
        .select({ session: sessionsTable, user: usersTable })
        .from(sessionsTable)
        .innerJoin(usersTable, eq(sessionsTable.user_id, usersTable.id))
        .where(eq(sessionsTable.id, sessionId))

    if (rows.length === 0) return null

    const { session, user } = rows[0]

    // Delete expired sessions
    if (new Date(session.expires_at) < new Date()) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
        cookies.delete(SESSION_COOKIE, { path: '/' })
        return null
    }

    return user
}

/**
 * Deletes the current session and clears the cookie.
 */
export async function deleteSession(cookies) {
    const sessionId = cookies.get(SESSION_COOKIE)
    if (!sessionId) return

    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId))
    cookies.delete(SESSION_COOKIE, { path: '/' })
}
