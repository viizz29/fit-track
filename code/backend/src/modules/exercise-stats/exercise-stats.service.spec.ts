import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseStatsService } from './exercise-stats.service';
import { ExerciseStatsRepository } from './exercise-stats.repository';
import { ExerciseSchedulesRepository } from '../exercise-schedules/exercise-schedules.repository';
import { User } from '../users/user.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { getModelToken } from '@nestjs/sequelize';

describe('ExerciseStatsService', () => {
  let service: ExerciseStatsService;
  let statsRepository: jest.Mocked<ExerciseStatsRepository>;
  let schedulesRepository: jest.Mocked<ExerciseSchedulesRepository>;
  let userModel: { findAll: jest.Mock };
  let completionModel: { findAll: jest.Mock };
  let originalScheduledTasksEnabled: string | undefined;

  beforeEach(async () => {
    originalScheduledTasksEnabled = process.env.SCHEDULED_TASKS_ENABLED;
    jest.clearAllMocks();

    userModel = { findAll: jest.fn() };
    completionModel = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseStatsService,
        {
          provide: ExerciseStatsRepository,
          useValue: {
            upsert: jest.fn(),
            hasUnfinalized: jest.fn(),
            finalizeDate: jest.fn(),
            findAllTimeByUser: jest.fn(),
          },
        },
        {
          provide: ExerciseSchedulesRepository,
          useValue: {
            findAllByUser: jest.fn(),
          },
        },
        { provide: getModelToken(User), useValue: userModel },
        { provide: getModelToken(ExerciseCompletion), useValue: completionModel },
      ],
    }).compile();

    service = module.get(ExerciseStatsService);
    statsRepository = module.get(ExerciseStatsRepository);
    schedulesRepository = module.get(ExerciseSchedulesRepository);
  });

  afterEach(() => {
    if (originalScheduledTasksEnabled !== undefined) {
      process.env.SCHEDULED_TASKS_ENABLED = originalScheduledTasksEnabled;
    } else {
      delete process.env.SCHEDULED_TASKS_ENABLED;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('computeDailyStats', () => {
    it('should return early if SCHEDULED_TASKS_ENABLED is not set', async () => {
      delete process.env.SCHEDULED_TASKS_ENABLED;

      await service.computeDailyStats();

      expect(statsRepository.hasUnfinalized).not.toHaveBeenCalled();
    });

    it('should return early if SCHEDULED_TASKS_ENABLED is empty', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = '';

      await service.computeDailyStats();

      expect(statsRepository.hasUnfinalized).not.toHaveBeenCalled();
    });

    it('should skip if no unfinalized yesterday', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(false);

      await service.computeDailyStats();

      expect(statsRepository.finalizeDate).not.toHaveBeenCalled();
      expect(userModel.findAll).not.toHaveBeenCalled();
    });

    it('should compute and finalize if unfinalized yesterday exists', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);
      userModel.findAll.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(statsRepository.finalizeDate).toHaveBeenCalled();
    });

    it('should process each user with active schedules', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: new Date('2020-01-01'),
        },
      ] as any);
      completionModel.findAll.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(schedulesRepository.findAllByUser).toHaveBeenCalledWith('user-1');
      expect(statsRepository.upsert).toHaveBeenCalled();
    });

    it('should skip users with no active schedules', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(completionModel.findAll).not.toHaveBeenCalled();
    });
  });

  describe('findAllTimeByUser', () => {
    it('should return grouped stats by exercise type', async () => {
      statsRepository.findAllTimeByUser.mockResolvedValue([
        {
          exerciseTypeId: 'type-1',
          exerciseType: { name: 'Push-ups' },
          scheduledCount: 10,
          completedCount: 8,
        },
        {
          exerciseTypeId: 'type-1',
          exerciseType: { name: 'Push-ups' },
          scheduledCount: 5,
          completedCount: 4,
        },
        {
          exerciseTypeId: 'type-2',
          exerciseType: { name: 'Squats' },
          scheduledCount: 7,
          completedCount: 7,
        },
      ] as any);

      const result = await service.findAllTimeByUser('user-1');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(
        expect.objectContaining({
          exerciseTypeId: 'type-1',
          totalScheduled: 15,
          totalCompleted: 12,
        }),
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          exerciseTypeId: 'type-2',
          totalScheduled: 7,
          totalCompleted: 7,
        }),
      );
    });

    it('should return empty array for user with no stats', async () => {
      statsRepository.findAllTimeByUser.mockResolvedValue([]);

      const result = await service.findAllTimeByUser('user-1');

      expect(result).toEqual([]);
    });
  });

  describe('filterActiveOnDate (via computeDailyStats)', () => {
    it('should include DAILY schedules', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: new Date('2020-01-01'),
        },
      ] as any);
      completionModel.findAll.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(completionModel.findAll).toHaveBeenCalled();
    });

    it('should include WEEKLY schedule only on matching day', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const yesterdayDay = dayNames[yesterday.getDay()];

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'WEEKLY',
          weekdays: [yesterdayDay],
          startDatetime: new Date('2020-01-01'),
        },
      ] as any);
      completionModel.findAll.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(completionModel.findAll).toHaveBeenCalled();
    });

    it('should exclude WEEKLY schedule on non-matching day', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const nonMatchDay = dayNames[(yesterday.getDay() + 1) % 7];

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'WEEKLY',
          weekdays: [nonMatchDay],
          startDatetime: new Date('2020-01-01'),
        },
      ] as any);
      completionModel.findAll.mockResolvedValue([]);

      await service.computeDailyStats();

      expect(completionModel.findAll).not.toHaveBeenCalled();
    });

    it('should exclude schedule starting after the date', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: futureDate,
        },
      ] as any);

      await service.computeDailyStats();

      expect(completionModel.findAll).not.toHaveBeenCalled();
    });

    it('should count completions per schedule', async () => {
      process.env.SCHEDULED_TASKS_ENABLED = 'true';
      statsRepository.hasUnfinalized.mockResolvedValue(true);
      statsRepository.finalizeDate.mockResolvedValue([1]);

      userModel.findAll.mockResolvedValue([{ get: jest.fn().mockReturnValue('user-1') }]);
      schedulesRepository.findAllByUser.mockResolvedValue([
        {
          id: 'sch-1',
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: new Date('2020-01-01'),
        },
        {
          id: 'sch-2',
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: new Date('2020-01-01'),
        },
      ] as any);
      completionModel.findAll.mockResolvedValue([
        { scheduleId: 'sch-1' },
        { scheduleId: 'sch-1' },
        { scheduleId: 'sch-2' },
      ]);

      await service.computeDailyStats();

      expect(statsRepository.upsert).toHaveBeenCalledWith(
        'user-1',
        expect.any(String),
        'type-1',
        2,
        3,
      );
    });
  });
});
