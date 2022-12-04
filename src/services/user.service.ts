import { HttpException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class UserService {
  constructor(private db: PrismaService) {}

  async getUserByUid(uid: string) {
    let userData: User;

    try {
      userData = await this.db.user.findUnique({
        where: {
          id: uid,
        },
      });
    } catch (error) {
      throw new HttpException('user not found', 404);
    }

    delete userData.password;

    return userData;
  }

  async getUserByEmail(email: string) {
    let userData: User;

    try {
      userData = await this.db.user.findUnique({
        where: {
          email,
        },
      });
    } catch (error) {
      throw new HttpException('user not found', 404);
    }

    delete userData.password;

    return userData;
  }
}
