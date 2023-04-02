import 'reflect-metadata';
import 'dotenv/config';

import express, { Request, Response, NextFunction} from 'express';
import 'express-async-errors';

import '../../container';

import routes from './routes';
import { AppError } from '../../errors/AppError'

const app = express();

app.use(express.json());
app.use(routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    if(err instanceof AppError){
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
        });
    }

    console.log(err.stack);
    console.log(err.message);

    return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error',
    });
})

app.listen(3333, () => {
    console.log("Server run on port 3333");
})