import { File, PrismaClient } from '@prisma/client';
import fs, { existsSync, mkdirSync, writeFileSync } from 'fs';
import { Request, Response } from 'express';
import path from 'path';
import { HttpException } from '@nestjs/common';
import appConfig from 'src/config';

export type UpdateFile = {
  name?: string;
  keywords?: string;
  [key: string]: any;
};

export interface UrlData {
  protocol?: string;
  host?: string;
}

export function handleError<T>(error: T | null, status = 500) {
  if (error instanceof HttpException) {
    throw error;
  } else {
    const e = error as Error;
    if (typeof error === 'string') {
      throw new HttpException(error, status);
    } else {
      throw new HttpException(e.message, status);
    }
  }
}

function getProtocol(req: Request) {
  let proto = req.protocol;
  proto = (req.headers['x-forwarded-proto'] as string) ?? proto;
  return proto.split(/\s*,\s*/)[0];
}

export function getUrlData(req: Request): UrlData {
  const protocol = getProtocol(req);
  const host = req.headers.host;

  return {
    protocol: protocol,
    host: host,
  };
}

export function parsePath(pathname: string) {
  const projectName = path.basename(process.cwd());
  const listPath = pathname.split(/[\\/]/);
  let start = false;
  let newPath = '';
  listPath.forEach((item) => {
    if (start) {
      if (item !== 'public') {
        newPath += '/' + item;
      }
    }

    if (item === projectName) {
      start = true;
    }
  });

  return newPath;
}

export function uploadDestination(
  req: Request,
  file: Express.Multer.File,
  callback: (error: Error, destination: string) => void,
) {
  try {
    const now = new Date();
    let dir = `${now.getFullYear()}_${now.getMonth()}_${now.getDate()}`;
    dir = path.join(process.cwd(), appConfig.UPLOAD_DIR, dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true,
      });
    }

    callback(null, dir);
  } catch (error) {
    throw new HttpException((error as Error).message, 500);
  }
}
