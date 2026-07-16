import { Test, TestingModule } from '@nestjs/testing';
import { ExerciseNotificationsService } from './exercise-notifications.service';
import { EmailNotificationsService } from '../email-notifications/email-notifications.service';
import { ExerciseSchedule } from '../exercise-schedules/exercise-schedule.model';
import { ExerciseCompletion } from '../exercise-completions/exercise-completion.model';
import { getModelToken } from '@nestjs/sequelize';
import { MSG91 } from '../../util/send-email';

jest.mock('../../util/send-email', () => ({
  MSG91: {
    sendUpcomingTaskNotification: jest.fn().mockResolvedValue(undefined),
    sendMissedTaskNotification: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('ExerciseNotificationsService', () => {
  let service: ExerciseNotificationsService;
  let emailNotificationsService: jest.Mocked<EmailNotificationsService>;
  let exerciseScheduleModel: { findAll: jest.Mock };
  let exerciseCompletionModel: { count: jest.Mock };
  let originalEnableNotifications: string | undefined;

  beforeEach(async () => {
    originalEnableNotifications = process.env.ENABLE_NOTIFICATION_EMAILS;
    jest.clearAllMocks();
    (MSG91.sendUpcomingTaskNotification as jest.Mock).mockResolvedValue(
      undefined,
    );
    (MSG91.sendMissedTaskNotification as jest.Mock).mockResolvedValue(
      undefined,
    );

    exerciseScheduleModel = { findAll: jest.fn() };
    exerciseCompletionModel = { count: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseNotificationsService,
        {
          provide: EmailNotificationsService,
          useValue: {
            hasNotificationBeenSent: jest.fn(),
            logNotification: jest.fn(),
          },
        },
        {
          provide: getModelToken(ExerciseSchedule),
          useValue: exerciseScheduleModel,
        },
        {
          provide: getModelToken(ExerciseCompletion),
          useValue: exerciseCompletionModel,
        },
      ],
    }).compile();

    service = module.get(ExerciseNotificationsService);
    emailNotificationsService = module.get(EmailNotificationsService);
  });

  afterEach(() => {
    if (originalEnableNotifications !== undefined) {
      process.env.ENABLE_NOTIFICATION_EMAILS = originalEnableNotifications;
    } else {
      delete process.env.ENABLE_NOTIFICATION_EMAILS;
    }
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendExerciseNotifications', () => {
    it('should return early if ENABLE_NOTIFICATION_EMAILS is not set', async () => {
      delete process.env.ENABLE_NOTIFICATION_EMAILS;

      await service.sendExerciseNotifications();

      expect(exerciseScheduleModel.findAll).not.toHaveBeenCalled();
    });

    it('should return early if ENABLE_NOTIFICATION_EMAILS is empty', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = '';

      await service.sendExerciseNotifications();

      expect(exerciseScheduleModel.findAll).not.toHaveBeenCalled();
    });

    it('should fetch schedules and process each one', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';
      exerciseScheduleModel.findAll.mockResolvedValue([]);

      await service.sendExerciseNotifications();

      expect(exerciseScheduleModel.findAll).toHaveBeenCalledWith({
        include: expect.arrayContaining([
          expect.objectContaining({
            attributes: expect.arrayContaining(['userId', 'name', 'email']),
          }),
          expect.objectContaining({
            attributes: expect.arrayContaining(['id', 'name', 'description']),
          }),
        ]),
        raw: true,
      });
    });

    it('should handle upcoming notification for daily schedule', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: in5Min.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': 'Do push-ups',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).toHaveBeenCalledWith(
        'John',
        'john@test.com',
        'Push-ups',
        'Do push-ups',
      );
      expect(emailNotificationsService.logNotification).toHaveBeenCalledWith(
        'sch-1',
        'user-1',
        'UPCOMING',
        expect.any(Date),
        'SENT',
      );
    });

    it('should skip upcoming if notification already sent', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: new Date(now.getTime() - 3600000).toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(true);

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).not.toHaveBeenCalled();
    });

    it('should skip upcoming if next occurrence is outside 15-min window', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: new Date(now.getTime() + 3600000).toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).not.toHaveBeenCalled();
    });

    it('should skip upcoming if email is not set', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: in5Min.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': null,
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).not.toHaveBeenCalled();
    });

    it('should skip upcoming if notifications disabled', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: in5Min.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': false,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).not.toHaveBeenCalled();
    });

    it('should handle missed notification for daily schedule', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      sevenDaysAgo.setUTCHours(0, 0, 0, 0);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: sevenDaysAgo.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': 'Do push-ups',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );
      exerciseCompletionModel.count.mockResolvedValue(0);

      await service.sendExerciseNotifications();

      expect(MSG91.sendMissedTaskNotification).toHaveBeenCalledWith(
        'John',
        'john@test.com',
        'Push-ups',
        'Do push-ups',
      );
      expect(emailNotificationsService.logNotification).toHaveBeenCalledWith(
        'sch-1',
        'user-1',
        'MISSED',
        expect.any(Date),
        'SENT',
      );
    });

    it('should skip missed if exercise was completed', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: new Date(now.getTime() - 86400000).toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );
      exerciseCompletionModel.count.mockResolvedValue(1);

      await service.sendExerciseNotifications();

      expect(MSG91.sendMissedTaskNotification).not.toHaveBeenCalled();
    });

    it('should log FAILED status if upcoming email send fails', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: in5Min.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );
      (MSG91.sendUpcomingTaskNotification as jest.Mock).mockRejectedValue(
        new Error('Email service down'),
      );

      await service.sendExerciseNotifications();

      expect(emailNotificationsService.logNotification).toHaveBeenCalledWith(
        'sch-1',
        'user-1',
        'UPCOMING',
        expect.any(Date),
        'FAILED',
      );
    });

    it('should log FAILED status if missed email send fails', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
      sevenDaysAgo.setUTCHours(0, 0, 0, 0);
      const schedule = {
        id: 'sch-1',
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        startDatetime: sevenDaysAgo.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );
      exerciseCompletionModel.count.mockResolvedValue(0);
      (MSG91.sendMissedTaskNotification as jest.Mock).mockRejectedValue(
        new Error('Email service down'),
      );

      await service.sendExerciseNotifications();

      expect(emailNotificationsService.logNotification).toHaveBeenCalledWith(
        'sch-1',
        'user-1',
        'MISSED',
        expect.any(Date),
        'FAILED',
      );
    });

    it('should continue processing other schedules after one fails', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);
      const baseSchedule = {
        recurrenceType: 'DAILY',
        timezone: 'UTC',
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Push-ups',
        'exerciseType.description': '',
      };

      const badSchedule = {
        ...baseSchedule,
        id: 'bad-schedule',
        startDatetime: null,
      };
      const goodSchedule = {
        ...baseSchedule,
        id: 'good-schedule',
        startDatetime: in5Min.toISOString(),
      };

      exerciseScheduleModel.findAll.mockResolvedValue([
        badSchedule,
        goodSchedule,
      ]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).toHaveBeenCalled();
    });

    it('should handle weekly schedule with matching weekday', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const todayAbbr = dayNames[now.getDay()];
      const in5Min = new Date(now.getTime() + 5 * 60 * 1000);

      const schedule = {
        id: 'sch-1',
        recurrenceType: 'WEEKLY',
        weekdays: [todayAbbr],
        timezone: 'UTC',
        startDatetime: in5Min.toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Yoga',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).toHaveBeenCalled();
    });

    it('should skip weekly schedule with non-matching weekday', async () => {
      process.env.ENABLE_NOTIFICATION_EMAILS = 'true';

      const now = new Date();
      const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
      const nonMatchDay = dayNames[(now.getDay() + 1) % 7];

      const schedule = {
        id: 'sch-1',
        recurrenceType: 'WEEKLY',
        weekdays: [nonMatchDay],
        timezone: 'UTC',
        startDatetime: new Date(now.getTime() - 86400000 * 7).toISOString(),
        'user.userId': 'user-1',
        'user.name': 'John',
        'user.email': 'john@test.com',
        'user.isEmailNotificationsEnabled': true,
        'exerciseType.name': 'Yoga',
        'exerciseType.description': '',
      };
      exerciseScheduleModel.findAll.mockResolvedValue([schedule]);
      emailNotificationsService.hasNotificationBeenSent.mockResolvedValue(
        false,
      );

      await service.sendExerciseNotifications();

      expect(MSG91.sendUpcomingTaskNotification).not.toHaveBeenCalled();
    });
  });
});
