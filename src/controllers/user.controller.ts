import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '@Service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUser(@Query('uid') uid: string) {
    return this.userService.getUserByUid(uid);
  }
}
