import { Inject, Injectable } from '@nestjs/common';
import { MAIL_PROVIDER } from './mail.constants';
import { type MailProvider, SendMailOptions } from './mail.interfaces';
import { TemplateService } from './template.service';

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_PROVIDER)
    private readonly provider: MailProvider,

    private readonly templateService: TemplateService,
  ) {}

  async send(options: SendMailOptions) {
    return this.provider.sendMail(options);
  }

  async sendOtp(email: string, name: string, otp: string) {
    const html = await this.templateService.render('otp', {
      name,
      otp,
      expiryMinutes: 10,
    });

    await this.provider.sendMail({
      to: email,
      subject: 'Your verification code',
      html,
    });
  }

  async sendVerificationEmail(name: string, email: string, token: string) {
    const { PUBLIC_HOST_WITH_PORT } = process.env;
    const verification_link = `${PUBLIC_HOST_WITH_PORT}/verify-email?token=${token}`;

    const html = await this.templateService.render('verification', {
      name,
      company_name: 'Fitrack',
      verification_link,
    });

    await this.provider.sendMail({
      to: email,
      subject: 'Verify your email address',
      html,
    });
  }

  async sendPasswordResetEmail(name: string, email: string, token: string) {
    const { PUBLIC_HOST_WITH_PORT } = process.env;
    const reset_link = `${PUBLIC_HOST_WITH_PORT}/reset-password?token=${token}`;

    const html = await this.templateService.render('password_reset', {
      name,
      company_name: 'Fitrack',
      reset_link,
    });

    await this.provider.sendMail({
      to: email,
      subject: 'Reset your password',
      html,
    });
  }

  async sendUpcomingTaskNotification(
    name: string,
    email: string,
    task_name: string,
    task_description: string,
  ) {
    const html = await this.templateService.render('upcoming_task', {
      name,
      task_name,
      task_description,
    });

    await this.provider.sendMail({
      to: email,
      subject: `Upcoming: ${task_name}`,
      html,
    });
  }

  async sendMissedTaskNotification(
    name: string,
    email: string,
    task_name: string,
    task_description: string,
  ) {
    const html = await this.templateService.render('missed_task', {
      name,
      task_name,
      task_description,
    });

    await this.provider.sendMail({
      to: email,
      subject: `Missed: ${task_name}`,
      html,
    });
  }
}
