import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ExerciseSchedulesRepository } from './exercise-schedules.repository';
import { ExerciseSchedule } from './exercise-schedule.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';

describe('ExerciseSchedulesRepository', () => {
  let repository: ExerciseSchedulesRepository;
  let exerciseScheduleModel: typeof ExerciseSchedule;
  let exerciseCompletionModel: typeof ExerciseCompletion;

  const mockScheduleModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  };

  const mockCompletionModel = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSchedulesRepository,
        {
          provide: getModelToken(ExerciseSchedule),
          useValue: mockScheduleModel,
        },
        {
          provide: getModelToken(ExerciseCompletion),
          useValue: mockCompletionModel,
        },
      ],
    }).compile();

    repository = module.get<ExerciseSchedulesRepository>(
      ExerciseSchedulesRepository,
    );
    exerciseScheduleModel = module.get(getModelToken(ExerciseSchedule));
    exerciseCompletionModel = module.get(getModelToken(ExerciseCompletion));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('should create a schedule with dto and userId', async () => {
      const dto = {
        exerciseTypeId: 'type-1',
        recurrenceType: 'DAILY',
        startDatetime: '2026-07-01T08:00:00.000Z',
        timezone: 'America/New_York',
      };
      const userId = 'user-1';
      const expected = { id: 'sched-1', ...dto, userId };
      mockScheduleModel.create.mockResolvedValue(expected);

      const result = await repository.create(dto as any, userId);

      expect(mockScheduleModel.create).toHaveBeenCalledWith({ ...dto, userId });
      expect(result).toEqual(expected);
    });
  });

  describe('findAllByUser', () => {
    it('should return all schedules for a user', async () => {
      const schedules = [{ id: 'sched-1' }, { id: 'sched-2' }];
      mockScheduleModel.findAll.mockResolvedValue(schedules);

      const result = await repository.findAllByUser('user-1');

      expect(mockScheduleModel.findAll).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: [expect.any(Function)],
        raw: true,
      });
      expect(result).toEqual(schedules);
    });
  });

  describe('findById', () => {
    it('should find a schedule by id', async () => {
      mockScheduleModel.findByPk.mockResolvedValue({ id: 'sched-1' });

      const result = await repository.findById('sched-1');

      expect(mockScheduleModel.findByPk).toHaveBeenCalledWith('sched-1', {
        include: [expect.any(Function)],
      });
      expect(result).toEqual({ id: 'sched-1' });
    });

    it('should return null when not found', async () => {
      mockScheduleModel.findByPk.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByDate', () => {
    const makeSchedule = (
      id: string,
      recurrenceType: string,
      weekdays: string[] | null,
      startDatetime: string,
    ) => ({
      id,
      recurrenceType,
      weekdays,
      startDatetime,
      userId: 'user-1',
    });

    it('should return empty array when no schedules exist', async () => {
      mockScheduleModel.findAll.mockResolvedValue([]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toEqual([]);
    });

    it('should include a DAILY schedule that falls on the target date', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'DAILY',
        null,
        '2026-06-30T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sched-1');
      expect(result[0].completed).toBe(false);
    });

    it('should include a DAILY schedule every day from start date', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'DAILY',
        null,
        '2026-06-01T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(1);
    });

    it('should include a WEEKLY schedule on a matching weekday', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'WEEKLY',
        ['WED'],
        '2026-06-22T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('sched-1');
    });

    it('should exclude a WEEKLY schedule on a non-matching weekday', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'WEEKLY',
        ['MON', 'FRI'],
        '2026-06-22T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(0);
    });

    it('should exclude a schedule whose start date is after the target date', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'DAILY',
        null,
        '2026-07-10T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(0);
    });

    it('should exclude a schedule that is already completed for the day', async () => {
      const schedule = makeSchedule(
        'sched-1',
        'DAILY',
        null,
        '2026-06-30T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([schedule]);
      mockCompletionModel.findAll.mockResolvedValue([
        {
          scheduleId: 'sched-1',
          completionDatetime: new Date('2026-07-01T10:00:00Z'),
        },
      ]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(1);
      expect(result[0].completed).toBe(true);
    });

    it('should handle mixed DAILY and WEEKLY schedules', async () => {
      const daily = makeSchedule(
        'sched-d',
        'DAILY',
        null,
        '2026-06-01T08:00:00.000Z',
      );
      const weekly = makeSchedule(
        'sched-w',
        'WEEKLY',
        ['WED'],
        '2026-06-22T08:00:00.000Z',
      );
      mockScheduleModel.findAll.mockResolvedValue([daily, weekly]);
      mockCompletionModel.findAll.mockResolvedValue([]);

      const result = await repository.findByDate('user-1', '2026-07-01');

      expect(result).toHaveLength(2);
    });
  });

  describe('update', () => {
    it('should update a schedule and return affected count and rows', async () => {
      const attrs = { weekdays: ['MON', 'WED'] };
      mockScheduleModel.update.mockResolvedValue([1, [{ id: 'sched-1' }]]);

      const result = await repository.update('sched-1', attrs);

      expect(mockScheduleModel.update).toHaveBeenCalledWith(attrs, {
        where: { id: 'sched-1' },
        returning: true,
      });
      expect(result).toEqual([1, [{ id: 'sched-1' }]]);
    });
  });

  describe('remove', () => {
    it('should destroy a schedule if it exists', async () => {
      const destroy = jest.fn();
      mockScheduleModel.findByPk.mockResolvedValue({ id: 'sched-1', destroy });

      await repository.remove('sched-1');

      expect(destroy).toHaveBeenCalled();
    });

    it('should do nothing if schedule does not exist', async () => {
      mockScheduleModel.findByPk.mockResolvedValue(null);

      await repository.remove('nonexistent');

      expect(mockScheduleModel.findByPk).toHaveBeenCalledWith('nonexistent', {
        include: [expect.any(Function)],
      });
    });
  });
});
