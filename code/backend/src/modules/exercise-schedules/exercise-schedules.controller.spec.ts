import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseSchedulesController } from './exercise-schedules.controller';
import { ExerciseSchedulesService } from './exercise-schedules.service';
import { CreateExerciseScheduleDto } from './dto/create-exercise-schedule.dto';
import { QueryExerciseScheduleDto } from './dto/query-exercise-schedule.dto';
import { UpdateExerciseScheduleDto } from './dto/update-exercise-schedule.dto';

describe('ExerciseSchedulesController', () => {
  let controller: ExerciseSchedulesController;
  let service: ExerciseSchedulesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByDate: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { userId: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseSchedulesController],
      providers: [{ provide: ExerciseSchedulesService, useValue: mockService }],
    }).compile();

    controller = module.get<ExerciseSchedulesController>(
      ExerciseSchedulesController,
    );
    service = module.get<ExerciseSchedulesService>(ExerciseSchedulesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and userId', async () => {
      const dto = new CreateExerciseScheduleDto();
      mockService.create.mockResolvedValue({ id: '1' });

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with userId', async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser);

      expect(service.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('findByDate', () => {
    it('should call service.findByDate with userId and query', async () => {
      const query = new QueryExerciseScheduleDto();
      query.date = '2026-07-01';
      mockService.findByDate.mockResolvedValue([]);

      const result = await controller.findByDate(mockUser, query);

      expect(service.findByDate).toHaveBeenCalledWith('user-1', query);
      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with id and userId', async () => {
      mockService.findOne.mockResolvedValue({ id: 'sched-1' });

      const result = await controller.findOne('sched-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('sched-1', 'user-1');
      expect(result).toEqual({ id: 'sched-1' });
    });
  });

  describe('update', () => {
    it('should call service.update with id, dto, and userId', async () => {
      const dto = new UpdateExerciseScheduleDto();
      mockService.update.mockResolvedValue({ id: 'sched-1' });

      const result = await controller.update('sched-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('sched-1', dto, 'user-1');
      expect(result).toEqual({ id: 'sched-1' });
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and userId', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('sched-1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('sched-1', 'user-1');
      expect(result).toBeUndefined();
    });
  });
});
