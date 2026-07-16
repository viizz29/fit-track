import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MAIL_PROVIDER } from './mail.constants';
import { SmtpProvider } from './providers/smtp.provider';
import { TemplateService } from './template.service';

@Module({
  imports: [ConfigModule],
  providers: [
    TemplateService,
    MailService,
    SmtpProvider,
    {
      provide: MAIL_PROVIDER,
      useExisting: SmtpProvider,
    },
  ],
  exports: [MailService],
})
export class MailModule {}
