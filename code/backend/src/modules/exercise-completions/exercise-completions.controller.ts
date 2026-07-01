import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExerciseCompletionsService } from './exercise-completions.service';
import { CreateExerciseCompletionDto } from './dto/create-exercise-completion.dto';
import { QueryExerciseCompletionDto } from './dto/query-exercise-completion.dto';

@ApiTags('completions')
@ApiBearerAuth('bearerAuth')
@Controller('v1/completions')
export class ExerciseCompletionsController {
  constructor(
    private readonly exerciseCompletionsService: ExerciseCompletionsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Mark an exercise completion' })
  create(
    @Body() dto: CreateExerciseCompletionDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.exerciseCompletionsService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List completions with optional filters' })
  findAll(
    @CurrentUser() user: { userId: string },
    @Query() filters: QueryExerciseCompletionDto,
  ) {
    return this.exerciseCompletionsService.findAll(user.userId, filters);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a completion' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.exerciseCompletionsService.remove(id, user.userId);
  }
}
