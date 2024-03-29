import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction } from 'express';
import 'express-async-errors';
import cors from 'cors';

import '../../container';

import routes from './routes';
import { AppError } from '../../errors/AppError';

const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  console.log(err);
  console.log(err.stack);
  console.log(err.message);

  return res.status(500).json({
    status: 'error',
    message: 'Internal Server Error',
  });
});

const port = Number(process.env.PORT) || 3333;
const host = process.env.HOST || '127.0.0.1';

app.listen(port, host, () => {
  console.log(`Server run on port: ${port} and host: ${host}`);
});
