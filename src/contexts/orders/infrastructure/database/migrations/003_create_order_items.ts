import { Knex } from 'knex';

/**
 * Migration: Create order_items table
 *
 * OrderItem entities belong to Order aggregate
 * CASCADE DELETE enforces aggregate boundary
 * Each Money value object (unitPrice, itemDiscount) decomposes into amount + currency
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('order_items', (table) => {
    table.increments('id').primary();
    table
      .string('order_id', 255)
      .notNullable()
      .references('order_id')
      .inTable('orders')
      .onDelete('CASCADE');
    table.string('product_id', 255).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('unit_price_amount', 10, 2).notNullable();
    table.string('unit_price_currency', 3).notNullable();
    table.decimal('item_discount_amount', 10, 2).notNullable();
    table.string('item_discount_currency', 3).notNullable();

    // Index for loading items by order
    table.index('order_id', 'idx_order_items_order_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('order_items');
}
