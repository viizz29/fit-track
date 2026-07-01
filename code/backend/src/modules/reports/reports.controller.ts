import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReportsService } from './reports.service';
import {
  CompletionsQueryDto,
  MissedQueryDto,
  CompletionRateQueryDto,
} from './dto/report-query.dto';

@ApiTags('reports')
@ApiBearerAuth('bearerAuth')
@Controller('v1/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('completions')
  @ApiOperation({ summary: 'Get completed exercises report grouped by period' })
  getCompletions(
    @CurrentUser() user: { userId: string },
    @Query() query: CompletionsQueryDto,
  ) {
    return this.reportsService.getCompletions(
      user.userId,
      query.startDate,
      query.endDate,
      query.period,
    );
  }

  @Get('missed')
  @ApiOperation({ summary: 'Get missed exercises count' })
  getMissed(
    @CurrentUser() user: { userId: string },
    @Query() query: MissedQueryDto,
  ) {
    return this.reportsService.getMissed(
      user.userId,
      query.startDate,
      query.endDate,
    );
  }

  @Get('completion-rate')
  @ApiOperation({ summary: 'Get completion rate and streak' })
  getCompletionRate(
    @CurrentUser() user: { userId: string },
    @Query() query: CompletionRateQueryDto,
  ) {
    return this.reportsService.getCompletionRate(
      user.userId,
      query.startDate,
      query.endDate,
    );
  }
}
