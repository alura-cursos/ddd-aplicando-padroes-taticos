import Knex from 'knex';

export interface KnexConfig {
  client: string;
  connection: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
  };
  migrations?: {
    directory: string;
    extension: string;
  };
}

/**
 * Create Knex instance for OrderRepository
 *
 * In production, configuration would come from environment variables
 * For this educational example, we keep it simple
 */
export function createKnexInstance(config: KnexConfig): Knex.Knex {
  return Knex(config);
}

/**
 * Default configuration for local development
 */
export function getDefaultKnexConfig(): KnexConfig {
  return {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'orders_dev',
    },
    migrations: {
      directory: __dirname + '/migrations',
      extension: 'ts',
    },
  };
}
