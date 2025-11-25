import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const filesTable = sqliteTable('file', {
    id: integer('id').primaryKey(),
    name: text('name'),
    format: text('format'),
    width: integer('width'),
    height: integer('height'),
    new_width: integer('new_width'),
    new_height: integer('new_height'),
    expiry_date: text('expiry_date'),
    processed: integer('processed'),
    start_date: text('start_date'),
    end_date: text('end_date'),
    compressing: integer('compressing'),
    quality: integer('quality'),
    size: integer('size'),
    uuid: text('uuid'),
})