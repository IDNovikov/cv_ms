import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { CreateMessageDTO } from './domain/dto/CreateMessageDTO';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;
  private readonly logger = new Logger(MailService.name);
  constructor(private readonly config: ConfigService) {}
  onModuleInit() {
    const host = (this.config.get<string>('SMTP_HOST') ?? '').trim();
    const port = Number(this.config.get('SMTP_PORT')) || 465;
    const user = this.config.get<string>('EMAIL_USER');
    const pass = this.config.get<string>('EMAIL_PASS');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
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
      this.logger.error(error.stack);
      throw new ServiceUnavailableException('Error with mailer');
    }
  }
}
