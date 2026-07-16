import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import { TemplateService } from './template.service';
import { MAIL_PROVIDER } from './mail.constants';
import { MailProvider } from './mail.interfaces';

describe('MailService', () => {
  let service: MailService;
  let mockProvider: jest.Mocked<MailProvider>;
  let mockTemplateService: jest.Mocked<TemplateService>;
  let originalPublicHost: string | undefined;

  beforeEach(async () => {
    originalPublicHost = process.env.PUBLIC_HOST_WITH_PORT;
    process.env.PUBLIC_HOST_WITH_PORT = 'http://localhost:3000';

    mockProvider = {
      sendMail: jest.fn().mockResolvedValue(undefined),
    };

    mockTemplateService = {
      render: jest.fn().mockResolvedValue('<html>rendered</html>'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: MAIL_PROVIDER,
          useValue: mockProvider,
        },
        {
          provide: TemplateService,
          useValue: mockTemplateService,
        },
      ],
    }).compile();

    service = module.get(MailService);
  });

  afterEach(() => {
    if (originalPublicHost !== undefined) {
      process.env.PUBLIC_HOST_WITH_PORT = originalPublicHost;
    } else {
      delete process.env.PUBLIC_HOST_WITH_PORT;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should delegate to provider.sendMail with given options', async () => {
      const options = {
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
      };

      await service.send(options);

      expect(mockProvider.sendMail).toHaveBeenCalledWith(options);
    });

    it('should return the result from provider.sendMail', async () => {
      mockProvider.sendMail.mockResolvedValue(undefined);

      const result = await service.send({
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('sendOtp', () => {
    it('should render otp template with correct context', async () => {
      await service.sendOtp('user@test.com', 'Alice', '123456');

      expect(mockTemplateService.render).toHaveBeenCalledWith('otp', {
        name: 'Alice',
        otp: '123456',
        expiryMinutes: 10,
      });
    });

    it('should call provider.sendMail with subject "Your verification code"', async () => {
      await service.sendOtp('user@test.com', 'Alice', '123456');

      expect(mockProvider.sendMail).toHaveBeenCalledWith({
        to: 'user@test.com',
        subject: 'Your verification code',
        html: '<html>rendered</html>',
      });
    });
  });

  describe('sendVerificationEmail', () => {
    it('should construct verification_link from env and token', async () => {
      await service.sendVerificationEmail('Bob', 'bob@test.com', 'abc-token');

      expect(mockTemplateService.render).toHaveBeenCalledWith('verification', {
        name: 'Bob',
        company_name: 'Fitrack',
        verification_link: 'http://localhost:3000/verify-email?token=abc-token',
      });
    });

    it('should call provider.sendMail with subject "Verify your email address"', async () => {
      await service.sendVerificationEmail('Bob', 'bob@test.com', 'abc-token');

      expect(mockProvider.sendMail).toHaveBeenCalledWith({
        to: 'bob@test.com',
        subject: 'Verify your email address',
        html: '<html>rendered</html>',
      });
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should construct reset_link from env and token', async () => {
      await service.sendPasswordResetEmail(
        'Carol',
        'carol@test.com',
        'reset-token',
      );

      expect(mockTemplateService.render).toHaveBeenCalledWith(
        'password_reset',
        {
          name: 'Carol',
          company_name: 'Fitrack',
          reset_link: 'http://localhost:3000/reset-password?token=reset-token',
        },
      );
    });

    it('should call provider.sendMail with subject "Reset your password"', async () => {
      await service.sendPasswordResetEmail(
        'Carol',
        'carol@test.com',
        'reset-token',
      );

      expect(mockProvider.sendMail).toHaveBeenCalledWith({
        to: 'carol@test.com',
        subject: 'Reset your password',
        html: '<html>rendered</html>',
      });
    });
  });

  describe('sendUpcomingTaskNotification', () => {
    it('should render upcoming_task template with task context', async () => {
      await service.sendUpcomingTaskNotification(
        'Dave',
        'dave@test.com',
        'Push-ups',
        'Do 20 reps',
      );

      expect(mockTemplateService.render).toHaveBeenCalledWith('upcoming_task', {
        name: 'Dave',
        task_name: 'Push-ups',
        task_description: 'Do 20 reps',
      });
    });

    it('should call provider.sendMail with subject containing task name', async () => {
      await service.sendUpcomingTaskNotification(
        'Dave',
        'dave@test.com',
        'Push-ups',
        'Do 20 reps',
      );

      expect(mockProvider.sendMail).toHaveBeenCalledWith({
        to: 'dave@test.com',
        subject: 'Upcoming: Push-ups',
        html: '<html>rendered</html>',
      });
    });
  });

  describe('sendMissedTaskNotification', () => {
    it('should render missed_task template with task context', async () => {
      await service.sendMissedTaskNotification(
        'Eve',
        'eve@test.com',
        'Yoga',
        'Morning session',
      );

      expect(mockTemplateService.render).toHaveBeenCalledWith('missed_task', {
        name: 'Eve',
        task_name: 'Yoga',
        task_description: 'Morning session',
      });
    });

    it('should call provider.sendMail with subject containing task name', async () => {
      await service.sendMissedTaskNotification(
        'Eve',
        'eve@test.com',
        'Yoga',
        'Morning session',
      );

      expect(mockProvider.sendMail).toHaveBeenCalledWith({
        to: 'eve@test.com',
        subject: 'Missed: Yoga',
        html: '<html>rendered</html>',
      });
    });
  });

  describe('error propagation', () => {
    it('should propagate template rendering errors', async () => {
      mockTemplateService.render.mockRejectedValue(
        new Error('Template not found'),
      );

      await expect(
        service.sendOtp('user@test.com', 'Alice', '123456'),
      ).rejects.toThrow('Template not found');
    });

    it('should propagate provider send errors', async () => {
      mockProvider.sendMail.mockRejectedValue(
        new Error('SMTP connection failed'),
      );

      await expect(
        service.sendOtp('user@test.com', 'Alice', '123456'),
      ).rejects.toThrow('SMTP connection failed');
    });
  });
});
