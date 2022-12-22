import { uploadDestination } from '@Lib/api/file';
import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Req,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { CloudService } from '@Service/cloud.service';
import { PrismaService } from '@Service/prisma.service';
import { Request } from 'express';
import { diskStorage } from 'multer';

@Controller('api/file')
export class CloudController {
  constructor(private db: PrismaService, private cloudService: CloudService) {}

  @Get('id/:file_id')
  async getFile(@Req() req: Request) {
    return this.cloudService.getFileMetadata(this.db, req);
  }

  @UseInterceptors(FileInterceptor('file'))
  @Put('id/:file_id')
  async updateFile(@Req() req: Request) {
    return this.cloudService.updateFile(this.db, req);
  }

  @Delete('id/:file_id')
  async deleteFile(@Req() req: Request) {
    return this.cloudService.deleteFile(this.db, req);
  }

  @Get('search')
  async searchFile(@Req() req: Request) {
    return this.cloudService.searchFile(this.db, req);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDestination,
        filename(_req, file, callback) {
          callback(null, `${Date.now()}_${file.originalname}`);
        },
      }),
    }),
  )
  async uploadFile(@Req() req: Request) {
    return this.cloudService.uploadFile(this.db, req);
  }
}
