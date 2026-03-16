import {
  Injectable,
  Logger,
  OnModuleInit,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CreateMessageDTO } from './domain/dto/CreateMessageDTO';

@Injectable()
export class MailService implements OnModuleInit {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const host = (this.config.get<string>('SMTP_HOST') ?? '').trim();
    const port = Number(this.config.get('SMTP_PORT')) || 465;
    const secureFromEnv = this.parseBoolean(this.config.get('SMTP_SECURE'));
    const secure = secureFromEnv ?? port === 465;
    const user = this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('EMAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      requireTLS: !secure,
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
      logger: true,
      debug: true,
      tls: {
        servername: host,
        minVersion: 'TLSv1.2',
      },
      auth: { user, pass },
    });

    try {
      await this.transporter.verify();
      this.logger.log(`SMTP ready: ${host}:${port}, secure=${secure}`);
    } catch (error) {
      this.logger.error(
        `SMTP verify failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new ServiceUnavailableException('SMTP connection failed');
    }
  }

  async sendMail(
    dto: CreateMessageDTO,
  ): Promise<SMTPTransport.SentMessageInfo> {
    const { from, toEmail, subject, text, html } = dto;
    try {
      const mail: nodemailer.SendMailOptions = {
        from: `"${from ? from : ''}" <${this.config.get('EMAIL_USER')}>`,
        to: toEmail,
        subject: subject,
        text,
        html: html ?? text,
      };

      const info = await this.transporter.sendMail(mail);
      return info;
    } catch (error) {
      this.logger.error(
        `SMTP send failed: ${(error as Error).message}`,
        (error as Error).stack,
      );
      throw new ServiceUnavailableException('Error with mailer');
    }
  }

  private parseBoolean(value: unknown): boolean | undefined {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
    return undefined;
  }
}
