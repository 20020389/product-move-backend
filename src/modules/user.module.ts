import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { UserMiddleware } from '@Middleware/user.middware';
import { UserController } from '@Controller/user.controller';
import { PrismaService } from '@Service/prisma.service';
import { UserService } from '@Service/user.service';

@Module({
  controllers: [UserController],
  providers: [PrismaService, UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(UserMiddleware).forRoutes('user');
  }
}
