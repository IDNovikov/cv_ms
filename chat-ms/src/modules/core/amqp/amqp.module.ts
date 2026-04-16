import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  RabbitMQModule,
  RabbitRpcParamsFactory,
} from '@golevelup/nestjs-rabbitmq';
import { amqpConfig } from './amqp.config';
import { RabbitService } from './amqp.service';

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
  providers: [RabbitRpcParamsFactory, RabbitService],
  exports: [RabbitMQModule, RabbitRpcParamsFactory, RabbitService],
})
export class AmqpModule {}
