import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ExerciseSchedulesRepository } from './exercise-schedules.repository';
import {
  CreateExerciseScheduleDto,
  VALID_WEEKDAYS,
} from './dto/create-exercise-schedule.dto';
import { UpdateExerciseScheduleDto } from './dto/update-exercise-schedule.dto';
import { QueryExerciseScheduleDto } from './dto/query-exercise-schedule.dto';
import moment from 'moment-timezone';

@Injectable()
export class ExerciseSchedulesService {
  constructor(
    private readonly exerciseSchedulesRepository: ExerciseSchedulesRepository,
  ) {}

  private validateWeekdays(
    weekdays: string[] | undefined,
    recurrenceType: string,
  ) {
    if (recurrenceType === 'WEEKLY') {
      if (!weekdays || weekdays.length === 0) {
        throw new BadRequestException(
          'weekdays is required when recurrenceType is WEEKLY',
        );
      }
      const invalid = weekdays.filter(
        (w) => !(VALID_WEEKDAYS as readonly string[]).includes(w),
      );
      if (invalid.length > 0) {
        throw new BadRequestException(
          `Invalid weekdays: ${invalid.join(', ')}. Valid values: ${VALID_WEEKDAYS.join(', ')}`,
        );
      }
    }
  }

  async create(dto: CreateExerciseScheduleDto, userId: string) {
    this.validateWeekdays(dto.weekdays, dto.recurrenceType);
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

  async getWeekExercises(userId: string, dto: QueryExerciseScheduleDto) {
    const dateStr = dto.date || new Date().toISOString().split('T')[0];
    const date = new Date(dateStr);

    const getMonday = (d: Date) => {
      const m = new Date(d);
      const day = m.getDay();
      const diff = m.getDate() - day + (day === 0 ? -6 : 1);
      m.setDate(diff);
      m.setHours(0, 0, 0, 0);
      return m;
    };

    const weekStart = getMonday(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = weekEnd.toISOString().split('T')[0];

    return this.exerciseSchedulesRepository.findWeekList(
      userId,
      weekStartStr,
      weekEndStr,
    );
  }

  async findByDate(userId: string, dto: QueryExerciseScheduleDto) {
    const date = dto.date || new Date().toISOString().split('T')[0];
    return this.exerciseSchedulesRepository.findByDate(userId, date);
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
    if (dto.recurrenceType || dto.weekdays) {
      const existing = await this.exerciseSchedulesRepository.findById(id);
      const type = dto.recurrenceType || existing!.recurrenceType;
      this.validateWeekdays(dto.weekdays, type);
    }
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
