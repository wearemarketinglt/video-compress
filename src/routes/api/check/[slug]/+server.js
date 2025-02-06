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
        console.log('File still compressing')
        return new Response(
            JSON.stringify({ compressing: selectedFile[0].compressing }),
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