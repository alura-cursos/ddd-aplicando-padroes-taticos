import { Knex } from 'knex';

/**
 * Migration: Create shipping_addresses table
 *
 * ShippingAddress is a value object with no domain identity,
 * so we use a surrogate key (SERIAL) for relational convenience
 */
export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('shipping_addresses', (table) => {
    table.increments('id').primary();
    table.string('street', 200).notNullable();
    table.string('address_line2', 200).nullable();
    table.string('city', 100).notNullable();
    table.string('state_or_province', 100).notNullable();
    table.string('postal_code', 20).notNullable();
    table.string('country', 100).notNullable();
    table.string('delivery_instructions', 500).nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('shipping_addresses');
}
