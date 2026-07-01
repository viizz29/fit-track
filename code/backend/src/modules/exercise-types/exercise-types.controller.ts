import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ExerciseTypesService } from './exercise-types.service';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

@ApiTags('exercises')
@ApiBearerAuth('bearerAuth')
@Controller('v1/exercises')
export class ExerciseTypesController {
  constructor(private readonly exerciseTypesService: ExerciseTypesService) {}

  @Post()
  @ApiOperation({ summary: 'Create an exercise type' })
  create(
    @Body() dto: CreateExerciseTypeDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.exerciseTypesService.create(dto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'List all exercise types for the current user' })
  findAll(@CurrentUser() user: { userId: string }) {
    return this.exerciseTypesService.findAll(user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an exercise type by ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.exerciseTypesService.findOne(id, user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an exercise type' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateExerciseTypeDto,
    @CurrentUser() user: { userId: string },
  ) {
    return this.exerciseTypesService.update(id, dto, user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an exercise type' })
  remove(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.exerciseTypesService.remove(id, user.userId);
  }
}
