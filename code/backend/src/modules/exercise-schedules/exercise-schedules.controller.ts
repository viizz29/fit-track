import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExerciseSchedulesService } from './exercise-schedules.service';
import { CreateExerciseScheduleDto } from './dto/create-exercise-schedule.dto';
import { UpdateExerciseScheduleDto } from './dto/update-exercise-schedule.dto';
import { QueryExerciseScheduleDto } from './dto/query-exercise-schedule.dto';

@ApiTags('schedules')
@ApiBearerAuth('bearerAuth')
@Controller('v1/schedules')
export class ExerciseSchedulesController {
  constructor(
    private readonly exerciseSchedulesService: ExerciseSchedulesService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create an exercise schedule' })
  create(
    @Body() dto: CreateExerciseScheduleDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.exerciseSchedulesService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all exercise schedules for the current user' })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.exerciseSchedulesService.findAll(user.userId);
  }

  @Get('date')
  @ApiOperation({
    summary: 'Get exercise schedules scheduled on a particular date',
  })
  findByDate(
    @CurrentUser() user: { userId: string },
    @Query() dto: QueryExerciseScheduleDto,
  ) {
    return this.exerciseSchedulesService.findByDate(user.userId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise schedule by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.exerciseSchedulesService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exercise schedule' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseScheduleDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.exerciseSchedulesService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exercise schedule' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.exerciseSchedulesService.remove(id, user.userId);
  }
}
