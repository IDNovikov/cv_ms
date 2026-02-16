import {
  MessageHandlerErrorBehavior,
  RabbitMQConfig,
  RabbitMQExchangeConfig,
} from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { SendMailContract } from './contracts/queues/mail/send-mail.contract';

const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: 'mail',
    type: 'direct',
  },
];

export const amqpConfig = (configService: ConfigService): RabbitMQConfig => {
  const uri = configService.get('AMQP_URI');

  if (!uri) throw new Error('"AMQP_URI" not found. Check .env');

  return {
    exchanges,
    uri,

    queues: [
      {
        name: SendMailContract.queue.queue,
        options: { durable: true },
      },
    ],
    connectionInitOptions: { wait: true, timeout: 20000 },
    enableControllerDiscovery: true,
    defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
    connectionManagerOptions: {
      heartbeatIntervalInSeconds: 15,
      reconnectTimeInSeconds: 5,
    },
  };
};
