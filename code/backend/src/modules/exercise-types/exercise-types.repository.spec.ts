import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/sequelize';
import { ExerciseTypesRepository } from './exercise-types.repository';
import { ExerciseType } from './exercise-type.model';

describe('ExerciseTypesRepository', () => {
  let repository: ExerciseTypesRepository;
  let exerciseTypeModel: typeof ExerciseType;

  const mockModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseTypesRepository,
        { provide: getModelToken(ExerciseType), useValue: mockModel },
      ],
    }).compile();

    repository = module.get<ExerciseTypesRepository>(ExerciseTypesRepository);
    exerciseTypeModel = module.get(getModelToken(ExerciseType));
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByName', () => {
    it('should find an exercise type by name and userId', async () => {
      mockModel.findOne.mockResolvedValue({ id: 'type-1', name: 'Running' });

      const result = await repository.findByName('Running', 'user-1');

      expect(mockModel.findOne).toHaveBeenCalledWith({
        where: { name: 'Running', userId: 'user-1' },
      });
      expect(result).toEqual({ id: 'type-1', name: 'Running' });
    });

    it('should return null when no match exists', async () => {
      mockModel.findOne.mockResolvedValue(null);

      const result = await repository.findByName('Unknown', 'user-1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create an exercise type with dto and userId', async () => {
      const dto = { name: 'Running', description: 'Outdoor running' };
      const expected = { id: 'type-1', ...dto, userId: 'user-1' };
      mockModel.create.mockResolvedValue(expected);

      const result = await repository.create(dto, 'user-1');

      expect(mockModel.create).toHaveBeenCalledWith({
        ...dto,
        userId: 'user-1',
      });
      expect(result).toEqual(expected);
    });
  });

  describe('findAllByUser', () => {
    it('should return all exercise types for a user', async () => {
      const types = [
        { id: 'type-1', name: 'Running' },
        { id: 'type-2', name: 'Swimming' },
      ];
      mockModel.findAll.mockResolvedValue(types);

      const result = await repository.findAllByUser('user-1');

      expect(mockModel.findAll).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        attributes: [
          'id',
          'userId',
          'name',
          'description',
          'created_at',
          'updated_at',
        ],
      });
      expect(result).toEqual(types);
    });
  });

  describe('findById', () => {
    it('should find an exercise type by id', async () => {
      mockModel.findByPk.mockResolvedValue({ id: 'type-1', name: 'Running' });

      const result = await repository.findById('type-1');

      expect(mockModel.findByPk).toHaveBeenCalledWith('type-1');
      expect(result).toEqual({ id: 'type-1', name: 'Running' });
    });

    it('should return null when not found', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update an exercise type and return affected count and rows', async () => {
      const attrs = { name: 'Jogging' };
      mockModel.update.mockResolvedValue([
        1,
        [{ id: 'type-1', name: 'Jogging' }],
      ]);

      const result = await repository.update('type-1', attrs);

      expect(mockModel.update).toHaveBeenCalledWith(attrs, {
        where: { id: 'type-1' },
        returning: true,
      });
      expect(result).toEqual([1, [{ id: 'type-1', name: 'Jogging' }]]);
    });
  });

  describe('remove', () => {
    it('should destroy an exercise type if it exists', async () => {
      const destroy = jest.fn();
      mockModel.findByPk.mockResolvedValue({ id: 'type-1', destroy });

      await repository.remove('type-1');

      expect(destroy).toHaveBeenCalled();
    });

    it('should do nothing if exercise type does not exist', async () => {
      mockModel.findByPk.mockResolvedValue(null);

      await repository.remove('nonexistent');

      expect(mockModel.findByPk).toHaveBeenCalledWith('nonexistent');
    });
  });
});
