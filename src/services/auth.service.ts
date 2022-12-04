import { HttpException, Injectable } from '@nestjs/common';
import validateUser, { isUserType, userTypes } from '@Lib/validateUser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import { PrismaService } from './prisma.service';

@Injectable()
export class AuthService {
  constructor(private db: PrismaService) {}

  async getUsers(): Promise<User[]> {
    return this.db.user.findMany();
  }

  async signup(user: AuthType.SignUpBody): Promise<AuthType.SignUpResponse> {
    let newUser: AuthType.SignUpBody;
    try {
      newUser = validateUser(user);

      if (!isUserType(user.type)) {
        user.type = userTypes[0];
      }

      if (!user.name) {
        user.name = user.email;
      }
    } catch (error) {
      throw new HttpException(error.message, 401);
    }

    const isExits = await this.db.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (isExits) {
      throw new HttpException('email is registered', 409);
    }

    const accessToken = jwt.sign(newUser, 'BE_ACCESSTOKEN_SNOW', {
      expiresIn: '1d',
    });

    await this.db.user.create({
      data: newUser,
    });

    delete newUser.password;

    return {
      accessToken: `Bearer ${accessToken}`,
    };
  }

  async signin(user: AuthType.SignInBody): Promise<AuthType.SignUpResponse> {
    try {
      validateUser({ ...user });
    } catch (error) {
      throw new HttpException(error.message, 401);
    }

    const userData = await this.db.user.findFirst({
      where: {
        email: user.email,
      },
    });

    if (!userData) {
      throw new HttpException('user not found', 401);
    }

    const truePassword = bcrypt.compareSync(user.password, userData.password);

    if (!truePassword) {
      throw new HttpException('wrong password', 403);
    }

    const accessToken = jwt.sign(
      { ...userData, password: undefined },
      'BE_ACCESSTOKEN_SNOW',
      {
        expiresIn: '1d',
      },
    );

    return {
      accessToken: `Bearer ${accessToken}`,
    };
  }
}
