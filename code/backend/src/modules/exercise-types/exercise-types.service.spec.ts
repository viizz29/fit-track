import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ExerciseTypesService } from './exercise-types.service';
import { ExerciseTypesRepository } from './exercise-types.repository';

describe('ExerciseTypesService', () => {
  let service: ExerciseTypesService;
  let repository: ExerciseTypesRepository;

  const mockRepository = {
    findByName: jest.fn(),
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseTypesService,
        { provide: ExerciseTypesRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ExerciseTypesService>(ExerciseTypesService);
    repository = module.get<ExerciseTypesRepository>(ExerciseTypesRepository);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an exercise type when name is unique for user', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        id: 'type-1',
        name: 'Running',
        userId: 'user-1',
      });

      const dto = { name: 'Running', description: 'Outdoor running' };
      const result = await service.create(dto, 'user-1');

      expect(repository.findByName).toHaveBeenCalledWith('Running', 'user-1');
      expect(repository.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({
        id: 'type-1',
        name: 'Running',
        userId: 'user-1',
      });
    });

    it('should throw ConflictException when name already exists for user', async () => {
      mockRepository.findByName.mockResolvedValue({
        id: 'existing',
        name: 'Running',
      });

      const dto = { name: 'Running', description: 'Duplicate' };
      await expect(service.create(dto, 'user-1')).rejects.toThrow(
        ConflictException,
      );

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all exercise types for a user', async () => {
      mockRepository.findAllByUser.mockResolvedValue([
        { id: 'type-1', name: 'Running' },
        { id: 'type-2', name: 'Swimming' },
      ]);

      const result = await service.findAll('user-1');

      expect(repository.findAllByUser).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return an exercise type when found and owned by user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => (key === 'userId' ? 'user-1' : null),
        id: 'type-1',
        name: 'Running',
      });

      const result = await service.findOne('type-1', 'user-1');

      expect(repository.findById).toHaveBeenCalledWith('type-1');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when exercise type not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('type-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when exercise type belongs to another user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => (key === 'userId' ? 'user-2' : null),
        id: 'type-1',
        name: 'Running',
      });

      await expect(service.findOne('type-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the exercise type', async () => {
      mockRepository.findById
        .mockResolvedValueOnce({
          get: (key: string) => (key === 'userId' ? 'user-1' : null),
          id: 'type-1',
        })
        .mockResolvedValueOnce({ id: 'type-1', name: 'Jogging' });
      mockRepository.update.mockResolvedValue([1, []]);

      const dto = { name: 'Jogging' };
      const result = await service.update('type-1', dto, 'user-1');

      expect(repository.update).toHaveBeenCalledWith('type-1', dto);
      expect(result).toEqual({ id: 'type-1', name: 'Jogging' });
    });
  });

  describe('remove', () => {
    it('should remove the exercise type if found and owned by user', async () => {
      mockRepository.findById.mockResolvedValue({
        get: (key: string) => (key === 'userId' ? 'user-1' : null),
        id: 'type-1',
      });
      mockRepository.remove.mockResolvedValue(undefined);

      await service.remove('type-1', 'user-1');

      expect(repository.remove).toHaveBeenCalledWith('type-1');
    });

    it('should throw NotFoundException when exercise type not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.remove('type-1', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
