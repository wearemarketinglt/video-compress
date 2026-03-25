import { redirect } from '@sveltejs/kit'
import { env } from '$env/dynamic/private'

export const GET = ({ cookies }) => {
    const state = crypto.randomUUID()

    // Store state in a short-lived cookie to verify on callback
    cookies.set('oauth_state', state, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 60 * 10, // 10 minutes
    })

    const params = new URLSearchParams({
        client_id: env.AUTH_GITHUB_ID,
        scope: 'read:user',
        state,
    })

    throw redirect(302, `https://github.com/login/oauth/authorize?${params}`)
}
