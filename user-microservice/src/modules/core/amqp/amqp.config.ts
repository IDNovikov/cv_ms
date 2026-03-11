import {
  MessageHandlerErrorBehavior,
  RabbitMQConfig,
  RabbitMQExchangeConfig,
} from '@golevelup/nestjs-rabbitmq';
import { ConfigService } from '@nestjs/config';
import { ServerError } from 'src/common/errors';

const exchanges: RabbitMQExchangeConfig[] = [
  {
    name: 'mail',
    type: 'direct',
  },
];

export const amqpConfig = (configService: ConfigService): RabbitMQConfig => {
  const uri = configService.get('AMQP_URI');

  if (!uri) throw new ServerError('"AMQP_URI" not found. Check .env');

  return {
    exchanges,
    uri,
    connectionInitOptions: { wait: false },

    defaultSubscribeErrorBehavior: MessageHandlerErrorBehavior.NACK,
    connectionManagerOptions: {
      heartbeatIntervalInSeconds: 15,
      reconnectTimeInSeconds: 30,
    },
  };
};
