import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('v1/users')
@ApiBearerAuth('bearerAuth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @Get('me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }
}
