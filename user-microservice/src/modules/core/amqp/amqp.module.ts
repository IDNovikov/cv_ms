import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  AmqpConnection,
  RabbitMQModule,
  RabbitRpcParamsFactory,
} from '@golevelup/nestjs-rabbitmq';
import { amqpConfig } from './amqp.config';

@Global()
@Module({
  imports: [
    ConfigModule,
    RabbitMQModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => amqpConfig(configService),
    }),
  ],
  providers: [RabbitRpcParamsFactory],
  exports: [RabbitMQModule, RabbitRpcParamsFactory],
})
export class AmqpModule {}
