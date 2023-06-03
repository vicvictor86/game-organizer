import 'dotenv/config';
import { DataSource } from 'typeorm';

const connectionSource = new DataSource({
  type: 'postgres',
  // host: process.env.PGHOST,
  url: process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : 'postgres://game_organizer_user:cXHS47WqxB6LtiKu27NhjkBinOtKATBv@dpg-che4v5rhp8ubgo2e3r30-a.ohio-postgres.render.com/game_organizer?ssl=true',
  // port: Number(process.env.PGPORT),
  // username: process.env.PGUSER,
  // password: process.env.PGPASSWORD,
  // database: process.env.PGDATABASE,
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
