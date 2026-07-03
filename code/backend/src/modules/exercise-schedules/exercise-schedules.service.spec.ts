import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ExerciseSchedulesService } from './exercise-schedules.service';
import { ExerciseSchedulesRepository } from './exercise-schedules.repository';
import { RecurrenceType } from './dto/create-exercise-schedule.dto';

describe('ExerciseSchedulesService', () => {
  let service: ExerciseSchedulesService;
  let repository: ExerciseSchedulesRepository;

  const mockRepository = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findByDate: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSchedulesService,
        { provide: ExerciseSchedulesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExerciseSchedulesService>(ExerciseSchedulesService);
    repository = module.get<ExerciseSchedulesRepository>(ExerciseSchedulesRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a schedule with UTC conversion for ISO string with timezone', async () => {
      const dto = {
        exerciseTypeId: 'type-1',
        recurrenceType: RecurrenceType.DAILY,
        startDatetime: '2026-07-01T08:00:00Z',
        timezone: 'America/New_York',
      };
      const userId = 'user-1';
      mockRepository.create.mockResolvedValue({ id: 'sched-1', ...dto, startDatetime: '2026-07-01T08:00:00.000Z' });

      const result = await service.create(dto, userId);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          exerciseTypeId: 'type-1',
          recurrenceType: 'DAILY',
        }),
        userId,
      );
      expect(result).toEqual(expect.objectContaining({ id: 'sched-1' }));
    });

    it('should convert timezone-naive datetime to UTC using provided timezone', async () => {
      const dto = {
        exerciseTypeId: 'type-1',
        recurrenceType: RecurrenceType.WEEKLY,
        weekdays: ['MON', 'WED', 'FRI'],
        startDatetime: '2026-07-01T08:00:00',
        timezone: 'America/New_York',
      };
      const userId = 'user-1';
      mockRepository.create.mockResolvedValue({ id: 'sched-2' });

      const result = await service.create(dto, userId);

      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({ id: 'sched-2' }));
    });
  });

  describe('findAll', () => {
    it('should return all schedules for a user', async () => {
      mockRepository.findAllByUser.mockResolvedValue([{ id: 'sched-1' }]);

      const result = await service.findAll('user-1');

      expect(repository.findAllByUser).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([{ id: 'sched-1' }]);
    });
  });

  describe('findByDate', () => {
    it('should return schedules by date', async () => {
      const query = { date: '2026-07-01' };
      const resultData = [{ id: 'sched-1', completed: false }];
      mockRepository.findByDate.mockResolvedValue(resultData);

      const result = await service.findByDate('user-1', query);

      expect(repository.findByDate).toHaveBeenCalledWith('user-1', '2026-07-01');
      expect(result).toEqual(resultData);
    });
  });

  describe('findOne', () => {
    it('should return a schedule when found and owned by user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => key === 'userId' ? 'user-1' : null,
        id: 'sched-1',
      });

      const result = await service.findOne('sched-1', 'user-1');

      expect(repository.findById).toHaveBeenCalledWith('sched-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when schedule not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('sched-1', 'user-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when schedule belongs to another user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => key === 'userId' ? 'user-2' : null,
        id: 'sched-1',
      });

      await expect(service.findOne('sched-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the schedule', async () => {
      mockRepository.findById
        .mockResolvedValueOnce({ get: (key: string) => key === 'userId' ? 'user-1' : null, id: 'sched-1' })
        .mockResolvedValueOnce({ id: 'sched-1', recurrenceType: 'DAILY' })
        .mockResolvedValueOnce({ id: 'sched-1', recurrenceType: 'DAILY' })
        .mockResolvedValueOnce({ id: 'sched-1', recurrenceType: 'WEEKLY' });
      mockRepository.update.mockResolvedValue([1, []]);
      const dto = { recurrenceType: RecurrenceType.WEEKLY, weekdays: ['MON', 'WED'] };

      const result = await service.update('sched-1', dto, 'user-1');

      expect(repository.update).toHaveBeenCalledWith('sched-1', dto);
      expect(result).toEqual(expect.objectContaining({ id: 'sched-1' }));
    });
  });

  describe('remove', () => {
    it('should remove the schedule if found and owned by user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => key === 'userId' ? 'user-1' : null,
        id: 'sched-1',
      });
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('sched-1', 'user-1');

      expect(repository.remove).toHaveBeenCalledWith('sched-1');
    });

    it('should throw NotFoundException when schedule not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('sched-1', 'user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
