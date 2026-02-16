import { RabbitExchangeConfig } from '../shared/rabbit-exchange-config.interface';

export const EXCHANGE_MAIL: RabbitExchangeConfig = {
  name: 'mail',
  type: 'direct',
};
