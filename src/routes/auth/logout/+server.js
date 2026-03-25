import { redirect } from '@sveltejs/kit'
import { deleteSession } from '$lib/server/auth'

export const GET = async ({ cookies }) => {
    await deleteSession(cookies)
    throw redirect(302, '/')
}
