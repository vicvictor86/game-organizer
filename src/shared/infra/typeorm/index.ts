import 'dotenv/config';
import { DataSource } from 'typeorm';

const connectionSource = new DataSource({
  type: 'postgres',
  url: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : process.env.DEVELOPMENT_DATABASE_URL,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: [process.env.NODE_ENV === 'production'
    ? './dist/modules/**/infra/typeorm/entities/*.js'
    : './src/modules/**/infra/typeorm/entities/*.ts',
  ],
  migrations: [process.env.NODE_ENV === 'production'
    ? './dist/shared/infra/typeorm/migrations/*.js'
    : './src/shared/infra/typeorm/migrations/*.ts',
  ],
});

connectionSource.initialize();

export { connectionSource };
