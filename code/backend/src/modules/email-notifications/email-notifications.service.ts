import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { EmailNotification } from './email-notification.model';

@Injectable()
export class EmailNotificationsService {
  constructor(
    @InjectModel(EmailNotification)
    private emailNotificationModel: typeof EmailNotification,
  ) {}

  async hasNotificationBeenSent(
    scheduleId: string,
    notificationType: string,
    occurrenceDatetime: Date,
  ): Promise<boolean> {
    const existing = await this.emailNotificationModel.findOne({
      where: {
        scheduleId,
        notificationType,
        sentTimestamp: occurrenceDatetime,
      },
    });
    return !!existing;
  }

  async logNotification(
    scheduleId: string,
    userId: string,
    notificationType: string,
    occurrenceDatetime: Date,
    status: string,
  ): Promise<void> {
    await this.emailNotificationModel.create({
      scheduleId,
      userId,
      notificationType,
      sentTimestamp: occurrenceDatetime,
      emailStatus: status,
    } as any);
  }
}
