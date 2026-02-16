import { Module } from '@nestjs/common';
import { MailModule } from './modules/mail/mail.module';
import { AppConfigModule } from './modules/config/config.module';
import { AmqpModule } from './modules/amqp/amqp.module';
import { ChannelsModule } from './modules/chanels/chanels.module';

@Module({
  imports: [MailModule, AppConfigModule, AmqpModule, ChannelsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
