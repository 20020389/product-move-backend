import {
  getUrlData,
  handleError,
  parsePath,
  UpdateFile,
  uploadDestination,
} from '@Lib/api/file';
import { HttpException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import fs, { existsSync } from 'fs';
import { Request, Response } from 'express';
import path from 'path';
import appConfig from 'src/config';

@Injectable()
export class CloudService {
  constructor() {}

  async name() {
    return '';
  }

  async getFile(prisma: PrismaClient, req: Request<UpdateFile>, res: Response) {
    const fileId = req.params.file_id as string;
    if (!fileId || typeof fileId !== 'string') {
      throw new HttpException('File id is invalid', 400);
    }
    const fileData = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
      select: {
        filepath: true,
        type: true,
        size: true,
      },
    });

    if (!fileData) {
      throw new HttpException('File data not found', 404);
    }

    const filepath = path.join(process.cwd(), fileData.filepath);

    const fileExits = fs.existsSync(filepath);

    if (!fileExits) {
      throw new HttpException('File data not found', 404);
    }

    res.writeHead(200, {
      'Content-Type': fileData.type,
      'Content-Length': fileData.size,
    });

    const streamFile = fs.createReadStream(filepath);

    streamFile
      .on('error', (err) => {
        res.end();
        streamFile.destroy(err);
      })
      .pipe(res);
  }

  async uploadFile(prisma: PrismaClient, req: Request<UpdateFile>) {
    const file = req.file;
    if (!file) {
      throw new HttpException('missing file from request', 400);
    }

    const { filename, keywords } = req.body;

    const newData: WithRequired<UpdateFile, 'name' | 'keywords'> = {
      name: filename ?? file.originalname,
      keywords: keywords ?? '',
    };

    const fileData = await prisma.$transaction(
      async (db) =>
        await db.file.create({
          data: {
            ...newData,
            size: file.size,
            type: file.mimetype,
            filepath: parsePath(file.path),
            createAt: new Date(),
            updateAt: new Date(),
          },
        }),
    );

    const { protocol, host } = getUrlData(req);

    return {
      ...fileData,
      url: `${protocol}://${host}${fileData.filepath.replace(
        '/upload/',
        '/cloud/',
      )}`,
    };
  }

  async getFileMetadata(prisma: PrismaClient, req: Request<UpdateFile>) {
    const fileId = req.params.file_id as string;
    const { protocol, host } = getUrlData(req);

    if (!fileId || typeof fileId !== 'string') {
      throw new HttpException('File id is invalid', 400);
    }

    const fileData = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });
    if (!fileData) {
      throw new HttpException('File data not found', 404);
    }

    return {
      ...fileData,
      fileUrl: `${protocol}://${host}${fileData.filepath.replace(
        '/upload/',
        '/cloud/',
      )}`,
    };
  }

  async updateFile(prisma: PrismaClient, req: Request<UpdateFile>) {
    const fileId = req.params.file_id;
    const { protocol, host } = getUrlData(req);

    if (!fileId || typeof fileId !== 'string') {
      throw new HttpException('File id is invalid', 400);
    }

    const fileData = await prisma.file.findUnique({
      where: {
        id: fileId,
      },
    });

    if (!fileData) {
      throw new HttpException('File data not found', 404);
    }

    const file = req.file;

    const { filename, keywords } = req.body;

    let newPath = '';

    if (file || filename || keywords) {
      try {
        return await prisma.$transaction(async (db) => {
          const newData: UpdateFile = {
            name: fileData.name,
            keywords: fileData.keywords ?? '',
            filepath: fileData.filepath,
          };

          if (filename) {
            newData.name = filename;
          }

          if (keywords) {
            newData.keywords = keywords;
          }

          if (file) {
            file.filename = `${Date.now()}_${file.originalname}`;
            const now = new Date();
            let dir = `${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
            dir = path.join(process.cwd(), appConfig.UPLOAD_DIR, dir);

            if (!fs.existsSync(dir)) {
              fs.mkdirSync(dir);
            }

            newPath = path.join(dir, file.filename);

            fs.writeFileSync(newPath, file.buffer);

            newData.filepath = parsePath(newPath);

            try {
              const oldpath = path.join(process.cwd(), fileData.filepath);
              fs.rmSync(oldpath);
            } catch (error) {
              console.log(error);
            }
          }

          const updated = await db.file.update({
            where: {
              id: fileData.id,
            },
            data: {
              ...newData,
              updateAt: new Date(),
            },
          });

          return {
            ...updated,
            url: `${protocol}://${host}${updated.filepath.replace(
              '/upload/',
              '/cloud/',
            )}`,
          };
        });
      } catch (error) {
        if (newPath && newPath !== '') {
          if (fs.existsSync(newPath)) {
            fs.rmSync(newPath);
          }
        }
        handleError(error, 500);
      }
    } else {
      throw new HttpException('Nothing to update', 400);
    }
  }

  async deleteFile(prisma: PrismaClient, req: Request) {
    const fileId = req.params.file_id;

    if (!fileId || typeof fileId !== 'string') {
      throw new HttpException('File id is invalid', 400);
    }

    try {
      const fileData = await prisma.file.findUnique({
        where: {
          id: fileId,
        },
        select: {
          id: true,
          filepath: true,
        },
      });

      if (!fileData) {
        throw new HttpException('File data not found', 404);
      }

      return await prisma.$transaction(async (db) => {
        await db.file.delete({
          where: {
            id: fileData.id,
          },
        });

        const filepath = path.join(process.cwd(), fileData.filepath);

        if (existsSync(filepath)) {
          fs.rmSync(filepath);
        }

        return {
          message: 'Delete file success',
        };
      });
    } catch (error) {
      handleError(error, 500);
    }
  }

  async searchFile(prisma: PrismaClient, req: Request<UpdateFile>) {
    const keywords = req.query.s;

    const { protocol, host } = getUrlData(req);

    if (!keywords || typeof keywords !== 'string') {
      return [];
    }

    const data = await prisma.$transaction(
      keywords.split(',').map((keyword) =>
        prisma.file.findMany({
          where: {
            keywords: {
              contains: keyword,
            },
          },
        }),
      ),
    );

    const files: any[] = [];

    data.forEach((res) => {
      const list = res.map((file) => ({
        ...file,
        url: `${protocol}://${host}/${file.filepath.replace(
          '/upload/',
          '/cloud/',
        )}`,
      }));
      files.push(...list);
    });

    return files;
  }
}
