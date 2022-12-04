import { Module } from '@nestjs/common';
import { AuthController } from '@Controller/auth.controller';
import { AuthService } from '@Service/auth.service';
import { PrismaService } from '@Service/prisma.service';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [PrismaService, AuthService],
})
export class AuthModule {}
