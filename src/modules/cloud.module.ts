import { CloudController } from '@Controller/cloud.controller';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CloudService } from '@Service/cloud.service';
import { PrismaService } from '@Service/prisma.service';
import path from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), '/upload'),
      serveRoot: '/cloud',
    }),
  ],
  controllers: [CloudController],
  providers: [PrismaService, CloudService],
})
export class CloudModule {}
