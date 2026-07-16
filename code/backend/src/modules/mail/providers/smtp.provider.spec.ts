import { Test, TestingModule } from '@nestjs/testing';
import { SmtpProvider } from './smtp.provider';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

jest.mock('nodemailer');

describe('SmtpProvider', () => {
  let provider: SmtpProvider;
  let mockSendMail: jest.Mock;
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.clearAllMocks();

    process.env.SMTP_HOST = 'smtp.test.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_USERNAME = 'testuser';
    process.env.SMTP_PASSWORD = 'testpass';
    process.env.MAIL_FROM_ADDRESS = 'noreply@test.com';

    mockSendMail = jest.fn().mockResolvedValue({ messageId: '1' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  async function createProvider() {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SmtpProvider,
        {
          provide: ConfigService,
          useValue: {},
        },
      ],
    }).compile();

    return module.get(SmtpProvider);
  }

  it('should be defined', async () => {
    provider = await createProvider();
    expect(provider).toBeDefined();
  });

  describe('constructor', () => {
    it('should create a nodemailer transport with env config', async () => {
      provider = await createProvider();

      expect(nodemailer.createTransport).toHaveBeenCalledWith({
        host: 'smtp.test.com',
        port: 587,
        secure: false,
        auth: {
          user: 'testuser',
          pass: 'testpass',
        },
      });
    });

    it('should set secure to true when SMTP_SECURE is "true"', async () => {
      process.env.SMTP_SECURE = 'true';

      provider = await createProvider();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: true }),
      );
    });

    it('should set secure to false when SMTP_SECURE is not "true"', async () => {
      process.env.SMTP_SECURE = 'false';

      provider = await createProvider();

      expect(nodemailer.createTransport).toHaveBeenCalledWith(
        expect.objectContaining({ secure: false }),
      );
    });
  });

  describe('sendMail', () => {
    it('should call transporter.sendMail with MAIL_FROM_ADDRESS as from', async () => {
      provider = await createProvider();

      await provider.sendMail({
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: undefined,
      });
    });

    it('should forward optional text field when provided', async () => {
      provider = await createProvider();

      await provider.sendMail({
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi',
      });

      expect(mockSendMail).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'user@test.com',
        subject: 'Hello',
        html: '<p>Hi</p>',
        text: 'Hi',
      });
    });
  });
});
