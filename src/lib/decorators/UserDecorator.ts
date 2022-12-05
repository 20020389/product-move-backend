import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';

export const UserDecorator = createParamDecorator(
  (data, context: ExecutionContext) => {
    const req: NestRequest = context.switchToHttp().getRequest();
    const accessToken = req.token;
    try {
      const userData = jwt.decode(accessToken.replace('Bearer ', '')) as User;
      if (userData.id) {
        return data ? userData[data] : userData;
      }
    } catch (error) {
      throw new HttpException('Unauthorized', 401);
    }
  },
);
