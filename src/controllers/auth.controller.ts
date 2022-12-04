import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { AuthService } from '@Service/auth.service';
import { Response } from 'express';

const token =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('users')
  async getUsers(@Res() res: Response) {
    res.cookie('access_token', token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
    });

    return res.json({
      user: await this.authService.getUsers(),
    });
  }

  @Post('signin')
  async signin(@Body() user: AuthType.SignInBody, @Res() res: Response) {
    const { accessToken } = await this.authService.signin(user);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 60 * 24 * 1000,
    });

    res.json({
      accessToken,
    });
  }

  @Post('signup')
  async signup(@Body() user: AuthType.SignUpBody, @Res() res: Response) {
    const { accessToken } = await this.authService.signup(user);
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV == 'production',
      maxAge: 60 * 60 * 24 * 1000,
    });

    res.json({
      accessToken,
    });
  }
}
