import {
  MessageHandlerErrorBehavior,
  RabbitMQConfig,
  RabbitMQExchangeConfig,
} from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { EXCHANGE_MAIL, SendMailContract } from '@noildm/contracts';

const exchanges: RabbitMQExchangeConfig[] = [EXCHANGE_MAIL];

export const amqpConfig = (configService: ConfigService): RabbitMQConfig => {
  const uri = configService.get('AMQP_URI');

  if (!uri) throw new Error('"AMQP_URI" not found. Check .env');

  return {
    exchanges,
    uri,
    queues: [
      {
        name: SendMailContract.queue.queue,
        options: SendMailContract.queue.queueOptions,
      },
    ],
    connectionInitOptions: { wait: false },
    enableControllerDiscovery: true,
    defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.REQUEUE,
    prefetchCount: 5,
    connectionManagerOptions: {
      heartbeatIntervalInSeconds: 15,
      reconnectTimeInSeconds: 5,
    },
  };
};
