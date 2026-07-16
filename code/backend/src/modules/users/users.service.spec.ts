import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UserRepository } from './users.repository';
import { NotFoundException, ConflictException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
}));

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;

  const mockUser = {
    userId: 'user-123',
    name: 'John',
    email: 'john@test.com',
    passwordHash: 'hashed-password',
    isEmailVerified: true,
    is2faEnabled: false,
    isEmailNotificationsEnabled: true,
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockUser.get.mockImplementation((arg: any) => {
      if (arg === 'userId') return 'user-123';
      if (arg && arg.plain) {
        return {
          userId: 'user-123',
          name: 'John',
          email: 'john@test.com',
          passwordHash: 'hashed-password',
          isEmailVerified: true,
          is2faEnabled: false,
          isEmailNotificationsEnabled: true,
        };
      }
      return undefined;
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findByEmail: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepository = module.get(UserRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      const result = await service.findOneByEmail('john@test.com');

      expect(userRepository.findByEmail).toHaveBeenCalledWith('john@test.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [mockUser];
      userRepository.findAll.mockResolvedValue(users as any);

      const result = await service.findAll();

      expect(result).toEqual(users);
    });
  });

  describe('findById', () => {
    it('should return user without passwordHash', async () => {
      const fullUser = {
        ...mockUser,
        passwordHash: 'hashed-password',
        get: jest.fn().mockReturnValue({
          userId: 'user-123',
          name: 'John',
          email: 'john@test.com',
          passwordHash: 'hashed-password',
        }),
      };
      userRepository.findById.mockResolvedValue(fullUser as any);

      const result = await service.findById('user-123');

      expect(userRepository.findById).toHaveBeenCalledWith('user-123', false);
      expect(result).toEqual({
        userId: 'user-123',
        name: 'John',
        email: 'john@test.com',
      });
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should return null if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update user profile', async () => {
      const plainUser = { ...mockUser };
      delete plainUser.get;
      userRepository.findById
        .mockResolvedValueOnce(plainUser as any)
        .mockResolvedValueOnce({
          ...mockUser,
          name: 'Jane',
          get: jest.fn().mockReturnValue({
            userId: 'user-123',
            name: 'Jane',
            email: 'john@test.com',
            passwordHash: 'hashed-password',
          }),
        } as any);
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.update('user-123', { name: 'Jane' });

      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        name: 'Jane',
      });
      expect(result).toEqual(expect.objectContaining({ name: 'Jane' }));
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { name: 'Jane' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if email is already in use', async () => {
      const plainUser = { ...mockUser };
      delete plainUser.get;
      userRepository.findById.mockResolvedValue(plainUser as any);
      const otherUser = {
        ...mockUser,
        userId: 'other-user',
        get: jest.fn().mockReturnValue('other-user'),
      };
      userRepository.findByEmail.mockResolvedValue(otherUser as any);

      await expect(
        service.update('user-123', { email: 'taken@test.com' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow updating to the same email', async () => {
      const plainUser = { ...mockUser };
      delete plainUser.get;
      userRepository.findById
        .mockResolvedValueOnce(plainUser as any)
        .mockResolvedValueOnce({
          ...mockUser,
          name: 'John',
          get: jest.fn().mockReturnValue({
            userId: 'user-123',
            name: 'John',
            email: 'john@test.com',
            passwordHash: 'hashed-password',
          }),
        } as any);
      userRepository.findByEmail.mockResolvedValue(mockUser as any);
      userRepository.update.mockResolvedValue([1, []]);

      await expect(
        service.update('user-123', { email: 'john@test.com' }),
      ).resolves.toBeDefined();
    });
  });

  describe('getEmailPreferences', () => {
    it('should return email notification preference', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);

      const result = await service.getEmailPreferences('user-123');

      expect(result).toEqual({ emailNotifications: true });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(service.getEmailPreferences('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateEmailPreferences', () => {
    it('should update email notification preference', async () => {
      userRepository.findById.mockResolvedValue(mockUser as any);
      userRepository.update.mockResolvedValue([1, []]);

      const result = await service.updateEmailPreferences('user-123', {
        emailNotifications: false,
      });

      expect(userRepository.update).toHaveBeenCalledWith('user-123', {
        isEmailNotificationsEnabled: false,
      });
      expect(result).toEqual({ emailNotifications: false });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateEmailPreferences('nonexistent', {
          emailNotifications: true,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('onModuleInit', () => {
    it('should seed test user if not exists', async () => {
      userRepository.findByEmail.mockResolvedValue(null);
      userRepository.create.mockResolvedValue({} as any);

      await service.onModuleInit();

      expect(userRepository.findByEmail).toHaveBeenCalledWith('test@gmail.com');
      expect(userRepository.create).toHaveBeenCalled();
    });

    it('should skip seeding if test user already exists', async () => {
      userRepository.findByEmail.mockResolvedValue(mockUser as any);

      await service.onModuleInit();

      expect(userRepository.create).not.toHaveBeenCalled();
    });
  });
});
