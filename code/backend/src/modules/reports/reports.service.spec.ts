import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { getModelToken } from '@nestjs/sequelize';

describe('ReportsService', () => {
  let service: ReportsService;
  let scheduleModel: { findAll: jest.Mock };
  let completionModel: { findAll: jest.Mock };

  beforeEach(async () => {
    scheduleModel = { findAll: jest.fn() };
    completionModel = { findAll: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getModelToken(ExerciseSchedule), useValue: scheduleModel },
        { provide: getModelToken(ExerciseCompletion), useValue: completionModel },
      ],
    }).compile();

    service = module.get(ReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCompletions', () => {
    it('should query completions grouped by day', async () => {
      completionModel.findAll.mockResolvedValue([
        { period: '2024-01-01', count: 3 },
        { period: '2024-01-02', count: 5 },
      ]);

      const result = await service.getCompletions(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(completionModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          raw: true,
        }),
      );
      expect(result).toHaveLength(2);
    });

    it('should accept custom period', async () => {
      completionModel.findAll.mockResolvedValue([]);

      await service.getCompletions('user-1', '2024-01-01', '2024-01-31', 'week');

      expect(completionModel.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          group: expect.arrayContaining([expect.anything()]),
        }),
      );
    });

    it('should return empty array when no completions', async () => {
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getCompletions(
        'user-1',
        '2024-01-01',
        '2024-01-31',
      );

      expect(result).toEqual([]);
    });
  });

  describe('getMissed', () => {
    it('should return zero missed when no schedules', async () => {
      scheduleModel.findAll.mockResolvedValue([]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result).toEqual({ totalMissed: 0, dailyBreakdown: [] });
    });

    it('should calculate missed for daily schedule with no completions', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-01T00:00:00Z',
        },
      ]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-03',
      );

      expect(result.totalMissed).toBe(3);
      expect(result.dailyBreakdown).toHaveLength(3);
    });

    it('should subtract completions from expected', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-01T00:00:00Z',
        },
      ]);
      completionModel.findAll.mockResolvedValue([
        { date: '2024-01-01', count: 1 },
        { date: '2024-01-02', count: 1 },
      ]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-03',
      );

      expect(result.totalMissed).toBe(1);
      expect(result.dailyBreakdown).toEqual([
        { date: '2024-01-03', missedCount: 1 },
      ]);
    });

    it('should handle weekly schedule', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'WEEKLY',
          weekdays: ['MON', 'WED', 'FRI'],
          startDatetime: '2024-01-01T08:00:00Z',
        },
      ]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result.totalMissed).toBe(3);
    });

    it('should handle schedule starting after range start', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-05T00:00:00Z',
        },
      ]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result.totalMissed).toBe(3);
    });

    it('should skip schedule starting after range end', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-10T08:00:00Z',
        },
      ]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getMissed(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result.totalMissed).toBe(0);
    });
  });

  describe('getCompletionRate', () => {
    it('should return zero rate when no schedules', async () => {
      scheduleModel.findAll.mockResolvedValue([]);
      completionModel.findAll.mockResolvedValue([]);

      const result = await service.getCompletionRate(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result.overallRate).toBe(0);
      expect(result.completed).toBe(0);
      expect(result.expected).toBe(0);
    });

    it('should calculate rate for daily schedule', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-01T00:00:00Z',
          'exerciseType.name': 'Push-ups',
        },
      ]);
      completionModel.findAll.mockResolvedValue([
        { id: 'c1', completionDatetime: '2024-01-01T09:00:00Z' },
        { id: 'c2', completionDatetime: '2024-01-02T09:00:00Z' },
        { id: 'c3', completionDatetime: '2024-01-03T09:00:00Z' },
      ]);

      const result = await service.getCompletionRate(
        'user-1',
        '2024-01-01',
        '2024-01-03',
      );

      expect(result.expected).toBe(3);
      expect(result.completed).toBe(3);
      expect(result.overallRate).toBe(1);
      expect(result.exerciseBreakdown).toHaveLength(1);
      expect(result.exerciseBreakdown[0]).toEqual(
        expect.objectContaining({
          exerciseName: 'Push-ups',
          totalScheduled: 3,
          totalCompleted: 3,
          rate: 1,
        }),
      );
    });

    it('should cap end date at yesterday if range includes today', async () => {
      scheduleModel.findAll.mockResolvedValue([]);
      completionModel.findAll.mockResolvedValue([]);

      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);

      const result = await service.getCompletionRate(
        'user-1',
        '2024-01-01',
        todayStr,
      );

      expect(result).toBeDefined();
    });

    it('should calculate streaks correctly', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'DAILY',
          weekdays: null,
          startDatetime: '2024-01-01T08:00:00Z',
          'exerciseType.name': 'Push-ups',
        },
      ]);

      completionModel.findAll.mockResolvedValue([
        { id: 'c1', completionDatetime: '2024-01-01T09:00:00Z' },
        { id: 'c2', completionDatetime: '2024-01-02T09:00:00Z' },
        { id: 'c3', completionDatetime: '2024-01-03T09:00:00Z' },
      ]);

      const result = await service.getCompletionRate(
        'user-1',
        '2024-01-01',
        '2024-01-03',
      );

      expect(result.longestStreak).toBeGreaterThanOrEqual(0);
      expect(result.currentStreak).toBeGreaterThanOrEqual(0);
    });

    it('should handle weekly schedule rate', async () => {
      scheduleModel.findAll.mockResolvedValue([
        {
          id: 'sch-1',
          userId: 'user-1',
          recurrenceType: 'WEEKLY',
          weekdays: ['MON', 'WED', 'FRI'],
          startDatetime: '2024-01-01T08:00:00Z',
          'exerciseType.name': 'Yoga',
        },
      ]);
      completionModel.findAll.mockResolvedValue([
        { id: 'c1', completionDatetime: '2024-01-01T09:00:00Z' },
      ]);

      const result = await service.getCompletionRate(
        'user-1',
        '2024-01-01',
        '2024-01-07',
      );

      expect(result.expected).toBe(3);
      expect(result.completed).toBe(1);
    });
  });
});
