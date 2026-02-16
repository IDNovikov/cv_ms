export interface AmqpBaseRequest<T = unknown> {
  type: string;
  payload: T;
  requestId: string;
  timeStamp: string;
  exchange?: string;
  routingKey?: string;
}
