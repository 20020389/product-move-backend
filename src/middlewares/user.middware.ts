import { HttpException, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export class UserMiddleware implements NestMiddleware {
  use(req: NestRequest, _res: Response, next: NextFunction) {
    const cookies = req.cookies;
    if (cookies) {
      const accessToken: string = cookies.access_token;
      if (accessToken) {
        req.token = accessToken;
        return next();
      }
    }

    throw new HttpException('Unauthorized', 401);
  }
}
