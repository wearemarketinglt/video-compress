import { eq } from 'drizzle-orm'
import { redirect } from '@sveltejs/kit'
import { writeFileSync } from 'fs'
import { filesTable } from '$lib/server/db/schema'
import { db } from '$lib/server/db'
import { formatDate } from '$lib'
import fs from 'fs'

export const load = async () => {
    const files = await db.select().from(filesTable)

    return {
       files 
    }
}

export const actions = {
    upload: async ({request}) => {
        const data = await request.formData()

        if (!data.has('file')) {
            return new Response('No file uploaded', { status: 400 })
        }

        const file = data.get('file')
        const file_name = file.name
        const format = file_name.split('.').pop()
        const uuid = crypto.randomUUID()
        const file_path = `uploads/${uuid}`

        writeFileSync(file_path, Buffer.from(await file.arrayBuffer()))

        const item = {
            name: file_name,
            format,
            expiry_date: formatDate(new Date(), 1),
            uuid: uuid
        }

        await db.insert(filesTable).values(item)

        redirect(302, `/${uuid}`)
    },
    extend: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        await db.update(filesTable).set({expiry_date: formatDate(new Date(), 1)}).where(eq(filesTable.uuid, uuid))
    },
	delete: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        await db.delete(filesTable).where(eq(filesTable.uuid, uuid))

        const file_path = `uploads/${uuid}`
        const compressed_path = `compressed/${uuid}`
        const poster_path = `compressed/posters/${uuid}`

        if (fs.existsSync(file_path)) {
            fs.unlinkSync(file_path)
        }

        if (fs.existsSync(compressed_path)) {
            fs.unlinkSync(compressed_path)
        }

        if (fs.existsSync(poster_path)) {
            fs.unlinkSync(poster_path)
        }
    },
    view: async ({request}) => {
        const data = await request.formData()

        const uuid = data.get('uuid')

        if (!uuid || uuid.length === 0) {
            return
        }

        redirect(302, `/${uuid}`)
    }
}