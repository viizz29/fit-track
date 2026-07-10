import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { EmailNotification } from './email-notification.model';
import { EmailNotificationsService } from './email-notifications.service';

@Module({
  imports: [SequelizeModule.forFeature([EmailNotification])],
  providers: [EmailNotificationsService],
  exports: [EmailNotificationsService],
})
export class EmailNotificationsModule {}
