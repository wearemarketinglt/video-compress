import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const filesTable = sqliteTable('file', {
    id: integer('id').primaryKey(),
    name: text('name'),
    format: text('format'),
    expiry_date: text('expiry_date'),
    processed: integer('processed'),
    processed_date: text('proc_date'),
    compressing: integer('compressing'),
    quality: integer('quality'),
    size: integer('size'),
    uuid: text('uuid'),
})