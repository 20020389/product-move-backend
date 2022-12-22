import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth.module';
import { CloudModule } from './modules/cloud.module';
import { UserModule } from './modules/user.module';

@Module({
  imports: [AuthModule, UserModule, CloudModule],
})
export class AppModule {}
