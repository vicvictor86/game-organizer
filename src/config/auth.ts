import { AppError } from "../shared/errors/AppError";

const jwtSecret = process.env.JWT_SECRET;

if(!jwtSecret) {
  throw new AppError('JWT_SECRET is not defined');
}

export const authConfig = {
  jwt: {
    secret: jwtSecret,
    expiresIn: '1d',
  },
}