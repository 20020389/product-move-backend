import { UserDecorator } from '@Lib/decorators';
import { Controller, Get, Query } from '@nestjs/common';
import { UserService } from '@Service/user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  getUser(@UserDecorator('id') uid: string) {
    return this.userService.getUserByUid(uid);
  }
}
