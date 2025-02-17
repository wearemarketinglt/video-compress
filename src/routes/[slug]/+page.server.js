import { eq } from 'drizzle-orm'
import { writeFileSync, existsSync, createReadStream, statSync } from 'fs'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'
import { formatDate } from '$lib'
import { redirect } from '@sveltejs/kit'
import { error } from '@sveltejs/kit'


export const load = async ({url, params}) => {
    const id = params.slug

    let selectedFile = await db.select().from(filesTable).where(eq(filesTable.uuid, id))

    if (!selectedFile.length) {
        error(404, 'File not found')
    }

    selectedFile = selectedFile[0]

    // check if the file exists in the file system
    if (!existsSync(`uploads/${id}`)) {
        return {
            status: 404
        }
    }

    return {
        id,
        selectedFile,
        status: 200
    }
}

export const actions = {
    rename: async ({request, params}) => {
        const data = await request.formData()

        const id = params.slug
        let name = data.get('name')

        if (!name || name.length === 0) {
            return
        }

        await db.update(filesTable).set({name}).where(eq(filesTable.uuid, id))

        return {
            status: 200,
            rename: {
                name
            }
        }
    },
    compress: async ({ request, params, fetch }) => {
        const data = await request.formData()

        const id = params.slug
        const quality = data.get('quality')
        const noaudio = data.get('noaudio')

        await db.update(filesTable).set({compressing: 1}).where(eq(filesTable.uuid, id))
        await db.update(filesTable).set({start_date: formatDate(new Date())}).where(eq(filesTable.uuid, id))

        const res = await fetch(`/api/compress/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                quality,
                noaudio
            })
        })

        if (res.status == 200) {
            const posterRes = await fetch(`/api/compress/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    codec: 'mjpeg',
                })
            })

            if (posterRes.status == 200) {
                const stats = statSync(`compressed/${id}`)
                const size = stats.size / 1024 / 1024

                await db.update(filesTable).set({compressing: 0}).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({processed: 1}).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({end_date: formatDate(new Date())}).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({quality}).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({expiry_date: formatDate(new Date(), 1)}).where(eq(filesTable.uuid, id))
                await db.update(filesTable).set({size: size.toFixed(2)}).where(eq(filesTable.uuid, id))

                return {
                    status: 200,
                    compressing: false
                }
            } else {
                return {
                    status: 500
                }
            }
        } else {
            return {
                status: 500
            }
        }
    },
}