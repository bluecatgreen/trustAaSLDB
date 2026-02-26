import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth.schema';

export const task = sqliteTable('task', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export const businessTransaction = sqliteTable('business_transaction', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),

	// Common fields
	description: text('description'),
	amount: text('amount'),
	transactionStartDate: integer('transaction_start_date', { mode: 'timestamp' }),
	transactionEndDate: integer('transaction_end_date', { mode: 'timestamp' }),

	// Creator info (the user who created the record)
	creatorId: text('creator_id').references(() => user.id),
	creatorRole: text('creator_role'), // 'provider' or 'receiver'

	// Provider fields
	providerId: text('provider_id').references(() => user.id),
	providerName: text('provider_name'),
	providerRating: integer('provider_rating'), // 1-5 stars

	// Receiver fields
	receiverId: text('receiver_id').references(() => user.id),
	receiverName: text('receiver_name'),
	receiverRating: integer('receiver_rating'),

	// Rating feedback
	providerRatingFeedback: text('provider_rating_feedback'),
	receiverRatingFeedback: text('receiver_rating_feedback'),

	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export * from './auth.schema';
