import { HttpException, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export class UserMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    const cookies = req.cookies;
    if (cookies) {
      const accessToken: string = cookies.access_token;
      if (accessToken) {
        try {
          const userData = jwt.decode(
            accessToken.replace('Bearer ', ''),
          ) as User;
          const uid = userData.id;
          if (uid) {
            req.query.uid = uid;
            next();
            return;
          }
        } catch (error) {
          throw new HttpException('Unauthorized', 401);
        }
      }
    }

    throw new HttpException('Unauthorized', 401);
  }
}
