import 'dotenv/config';
import { DataSource } from 'typeorm';

const connectionSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST,
  url: process.env.NODE_ENV === "production" ? process.env.DATABASE_URL : undefined,
  port: Number(process.env.PGPORT),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  entities: [
    "./src/modules/**/infra/typeorm/entities/*.ts"
  ],
  migrations: [
    "./src/shared/infra/typeorm/migrations/*.ts"
  ],
});

connectionSource.initialize();

export { connectionSource };