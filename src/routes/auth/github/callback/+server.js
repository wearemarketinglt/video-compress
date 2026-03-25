import { redirect, error } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'
import { db } from '$lib/server/db'
import { usersTable } from '$lib/server/db/schema'
import { eq } from 'drizzle-orm'
import { createSession } from '$lib/server/auth'

export const GET = async ({ url, cookies }) => {
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    const storedState = cookies.get('oauth_state')

    cookies.delete('oauth_state', { path: '/' })

    if (!code || !state || state !== storedState) {
        throw error(400, 'Invalid OAuth state')
    }

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({
            client_id: env.AUTH_GITHUB_ID,
            client_secret: env.AUTH_GITHUB_SECRET,
            code,
        }),
    })

    const tokenData = await tokenRes.json()

    if (!tokenData.access_token) {
        throw error(400, 'Failed to obtain access token from GitHub')
    }

    const accessToken = tokenData.access_token

    // Fetch GitHub user profile
    const githubUser = await fetch('https://api.github.com/user', {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
        },
    }).then((r) => r.json())

    // Look up user by GitHub ID
    const users = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.github_id, githubUser.id))

    if (users.length === 0) {
        throw redirect(302, '/auth/not-authorised')
    }

    const user = users[0]

    await createSession(cookies, user.id)

    throw redirect(302, '/')
}
