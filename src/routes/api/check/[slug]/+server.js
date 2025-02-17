import { eq } from 'drizzle-orm'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'

export async function GET({ url, params }) {
    const id = params.slug

    const selectedFile = await db.select().from(filesTable).where(eq(filesTable.uuid, id))

    if (!selectedFile) {
        return new Response(
            JSON.stringify({ error: 'File not found' }),
            { status: 404, headers: { 'Content-Type': 'application/json' } }
        )
    }

    if (selectedFile[0].compressing) {
        let compressing = selectedFile[0].compressing

        // if started more than 5 minutes ago, set compressing to false
        if (selectedFile[0].start_date) {
            const startDate = new Date(selectedFile[0].start_date)
            const currentDate = new Date()
            const diff = (currentDate - startDate) / 1000 / 60

            if (diff > 5) {
                await db.update(filesTable).set({ compressing: 0 }).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({ start_date: null }).where(eq(filesTable.uuid, id))
                compressing = 0
            }
        }

        return new Response(
            JSON.stringify({ compressing: compressing }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        )
    }

    const responseBody = {
        id,
        selectedFile: selectedFile[0],
    }

    return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    })
}