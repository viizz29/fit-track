import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseTypesController } from './exercise-types.controller';
import { ExerciseTypesService } from './exercise-types.service';
import { CreateExerciseTypeDto } from './dto/create-exercise-type.dto';
import { UpdateExerciseTypeDto } from './dto/update-exercise-type.dto';

describe('ExerciseTypesController', () => {
  let controller: ExerciseTypesController;
  let service: ExerciseTypesService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { userId: 'user-1' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExerciseTypesController],
      providers: [{ provide: ExerciseTypesService, useValue: mockService }],
    }).compile();

    controller = module.get<ExerciseTypesController>(ExerciseTypesController);
    service = module.get<ExerciseTypesService>(ExerciseTypesService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call service.create with dto and userId', async () => {
      const dto = new CreateExerciseTypeDto();
      dto.name = 'Running';
      mockService.create.mockResolvedValue({ id: 'type-1', name: 'Running' });

      const result = await controller.create(dto, mockUser);

      expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: 'type-1', name: 'Running' });
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

  describe('findOne', () => {
    it('should call service.findOne with id and userId', async () => {
      mockService.findOne.mockResolvedValue({ id: 'type-1', name: 'Running' });

      const result = await controller.findOne('type-1', mockUser);

      expect(service.findOne).toHaveBeenCalledWith('type-1', 'user-1');
      expect(result).toEqual({ id: 'type-1', name: 'Running' });
    });
  });

  describe('update', () => {
    it('should call service.update with id, dto, and userId', async () => {
      const dto = new UpdateExerciseTypeDto();
      dto.name = 'Jogging';
      mockService.update.mockResolvedValue({ id: 'type-1', name: 'Jogging' });

      const result = await controller.update('type-1', dto, mockUser);

      expect(service.update).toHaveBeenCalledWith('type-1', dto, 'user-1');
      expect(result).toEqual({ id: 'type-1', name: 'Jogging' });
    });
  });

  describe('remove', () => {
    it('should call service.remove with id and userId', async () => {
      mockService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('type-1', mockUser);

      expect(service.remove).toHaveBeenCalledWith('type-1', 'user-1');
      expect(result).toBeUndefined();
    });
  });
});
