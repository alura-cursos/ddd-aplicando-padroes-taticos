import { Knex } from 'knex';

/**
 * Migration: Create orders table
 *
 * Order aggregate root uses its domain OrderId as primary key (natural key pattern)
 * Money value objects decompose into amount + currency columns
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.string('order_id', 255).primary();
    table.string('cart_id', 255).notNullable();
    table.string('customer_id', 255).notNullable();
    table.string('status', 50).notNullable();
    table.string('payment_id', 255).nullable();
    table.decimal('global_discount_amount', 10, 2).notNullable();
    table.string('global_discount_currency', 3).notNullable();
    table
      .integer('shipping_address_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('shipping_addresses');
    table.timestamp('created_at').notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at').notNullable().defaultTo(knex.fn.now());

    // Index for findByCartId query (idempotent checkout)
    table.index('cart_id', 'idx_orders_cart_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('orders');
}
