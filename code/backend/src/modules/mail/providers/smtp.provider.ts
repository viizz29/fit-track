import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { MailProvider, SendMailOptions } from '../mail.interfaces';

@Injectable()
export class SmtpProvider implements MailProvider {
  private readonly transporter;

  constructor(private readonly config: ConfigService) {
    const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USERNAME, SMTP_PASSWORD } =
      process.env;

    this.transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD,
      },
    });
  }

  async sendMail(options: SendMailOptions): Promise<void> {
    const { MAIL_FROM_ADDRESS } = process.env;
    await this.transporter.sendMail({
      from: MAIL_FROM_ADDRESS,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
  }
}
