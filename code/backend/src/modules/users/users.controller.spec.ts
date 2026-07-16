import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
            getEmailPreferences: jest.fn(),
            updateEmailPreferences: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfile', () => {
    it('should return user profile by userId', async () => {
      const user = { userId: 'user-123' };
      const expected = {
        userId: 'user-123',
        name: 'John',
        email: 'john@test.com',
      };
      usersService.findById.mockResolvedValue(expected as any);

      const result = await controller.getProfile(user);

      expect(usersService.findById).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const user = { userId: 'user-123' };
      const dto = { name: 'Jane', email: 'jane@test.com' };
      const expected = {
        userId: 'user-123',
        name: 'Jane',
        email: 'jane@test.com',
      };
      usersService.update.mockResolvedValue(expected as any);

      const result = await controller.updateProfile(dto, user);

      expect(usersService.update).toHaveBeenCalledWith('user-123', dto);
      expect(result).toEqual(expected);
    });
  });

  describe('getEmailPreferences', () => {
    it('should return email preferences', async () => {
      const user = { userId: 'user-123' };
      const expected = { emailNotifications: true };
      usersService.getEmailPreferences.mockResolvedValue(expected);

      const result = await controller.getEmailPreferences(user);

      expect(usersService.getEmailPreferences).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(expected);
    });
  });

  describe('updateEmailPreferences', () => {
    it('should update email preferences', async () => {
      const user = { userId: 'user-123' };
      const dto = { emailNotifications: false };
      const expected = { emailNotifications: false };
      usersService.updateEmailPreferences.mockResolvedValue(expected);

      const result = await controller.updateEmailPreferences(dto, user);

      expect(usersService.updateEmailPreferences).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
      expect(result).toEqual(expected);
    });
  });
});
