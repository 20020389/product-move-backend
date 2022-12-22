import { promises as fs } from 'fs';

export async function writeFile(path: string, file: Express.Multer.File) {
  try {
    await fs.mkdir(path);
    return await fs.writeFile(
      `${path}/${file.filename || file.originalname}`,
      file.buffer,
    );
  } catch (error) {}
}
