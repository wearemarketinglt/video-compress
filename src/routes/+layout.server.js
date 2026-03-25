import { getUser } from '$lib/server/auth'

export const load = async ({ cookies }) => {
    const user = await getUser(cookies)
    return { user }
}
