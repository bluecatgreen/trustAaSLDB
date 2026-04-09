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

export const market = sqliteTable('market', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name'),
	country: text('country'),
	countryCode: text('country_code'),
	state: text('state'),
	city: text('city'),
	suburb: text('suburb'),
	neighbourhood: text('neighbourhood'),
	road: text('road'),
	postcode: text('postcode'),
	houseNumber: text('house_number'),
	displayName: text('display_name'),
	lat: text('lat'),
	lon: text('lon'),
	uniqueFields: text('unique_fields'), // JSON array of field names used for uniqueness
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	creatorId: text('creator_id').references(() => user.id)
});

export const listing = sqliteTable('listing', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => user.id),
	title: text('title').notNull(),
	description: text('description'),
	category: text('category'), // e.g., "products", "services"
	amount: text('amount'), // cost as string
	currency: text('currency').default('USD'),
	// Inline location fields
	locationName: text('location_name'),
	locationAddress: text('location_address'),
	locationLat: text('location_lat'),
	locationLon: text('location_lon'),
	listingStartDate: integer('listing_start_date', { mode: 'timestamp' }),
	listingEndDate: integer('listing_end_date', { mode: 'timestamp' }),
	status: text('status').default('active'), // 'active', 'inactive'
	createdAt: integer('created_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.$defaultFn(() => new Date())
});

export * from './auth.schema';
