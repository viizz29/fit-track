import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExerciseStatsService } from './exercise-stats.service';

@ApiTags('stats')
@ApiBearerAuth('bearerAuth')
@Controller('v1/stats')
export class ExerciseStatsController {
  constructor(private readonly statsService: ExerciseStatsService) {}

  @Get('exercises')
  @ApiOperation({ summary: 'Get all-time exercise stats for the current user' })
  findAllTime(@CurrentUser() user: { userId: string }) {
    return this.statsService.findAllTimeByUser(user.userId);
  }
}
