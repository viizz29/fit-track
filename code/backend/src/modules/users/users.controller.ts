import { Controller, Get, Put, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SkipEmailVerification } from '../../common/decorators/public.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateEmailPreferencesDto } from './dto/update-email-preferences.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('users')
@Controller('v1/users')
@ApiBearerAuth('bearerAuth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Get()
  // findAll() {
  //   return this.usersService.findAll();
  // }

  @SkipEmailVerification()
  @Get('me')
  getProfile(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }

  @SkipEmailVerification()
  @Patch('me')
  @ApiOperation({ summary: 'Update profile (name and/or email)' })
  updateProfile(
    @Body() dto: UpdateProfileDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.update(user.userId, dto);
  }

  @SkipEmailVerification()
  @Get('me/email-preferences')
  @ApiOperation({ summary: 'Get email notification preferences' })
  @ApiResponse({ status: 200, description: 'Returns email notification preference' })
  getEmailPreferences(@CurrentUser() user: { userId: string }) {
    return this.usersService.getEmailPreferences(user.userId);
  }

  @SkipEmailVerification()
  @Put('me/email-preferences')
  @ApiOperation({ summary: 'Update email notification preferences' })
  @ApiResponse({ status: 200, description: 'Email preferences updated' })
  updateEmailPreferences(
    @Body() dto: UpdateEmailPreferencesDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.usersService.updateEmailPreferences(user.userId, dto);
  }
}
