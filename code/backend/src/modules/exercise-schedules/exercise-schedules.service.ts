import { Injectable, NotFoundException } from '@nestjs/common';
import { ExerciseSchedulesRepository } from './exercise-schedules.repository';
import { CreateExerciseScheduleDto } from './dto/create-exercise-schedule.dto';
import { UpdateExerciseScheduleDto } from './dto/update-exercise-schedule.dto';
import { QueryExerciseScheduleDto } from './dto/query-exercise-schedule.dto';
import moment from 'moment-timezone';

@Injectable()
export class ExerciseSchedulesService {
  constructor(
    private readonly exerciseSchedulesRepository: ExerciseSchedulesRepository,
  ) {}

  async create(dto: CreateExerciseScheduleDto, userId: string) {
    const hasTimezone = /[Zz]|[+-]\d{2}:\d{2}$/.test(dto.startDatetime);
    const utcDatetime = hasTimezone
      ? moment(dto.startDatetime).utc().format()
      : moment.tz(dto.startDatetime, dto.timezone).utc().format();
    return this.exerciseSchedulesRepository.create(
      { ...dto, startDatetime: utcDatetime },
      userId,
    );
  }

  async findAll(userId: string) {
    return this.exerciseSchedulesRepository.findAllByUser(userId);
  }

  async findByDate(userId: string, dto: QueryExerciseScheduleDto) {
    return this.exerciseSchedulesRepository.findByDate(userId, dto.date);
  }

  async findOne(id: string, userId: string) {
    const schedule = await this.exerciseSchedulesRepository.findById(id);
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    if (schedule.get('userId') !== userId) {
      throw new NotFoundException('Schedule not found');
    }
    return schedule;
  }

  async update(id: string, dto: UpdateExerciseScheduleDto, userId: string) {
    await this.findOne(id, userId);
    if (dto.startDatetime) {
      const hasTimezone = /[Zz]|[+-]\d{2}:\d{2}$/.test(dto.startDatetime);
      dto.startDatetime = hasTimezone
        ? moment(dto.startDatetime).utc().format()
        : moment.tz(dto.startDatetime, dto.timezone!).utc().format();
    }
    await this.exerciseSchedulesRepository.update(id, dto as any);
    return this.exerciseSchedulesRepository.findById(id);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.exerciseSchedulesRepository.remove(id);
  }
}
