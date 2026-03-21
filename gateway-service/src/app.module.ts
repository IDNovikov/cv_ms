import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayModule } from './modules/gateway/gateway.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { APP_GUARD } from '@nestjs/core';
// import { ChatModule } from './modules/chat/chat.module';
// import { WSChat } from './modules/core/ws/ws.module';
import { GqlThrottlerGuard } from './common/guards/gql-throttler.quard';
import { ThrottlerModule } from '@nestjs/throttler';
import { gqlErrorHandler } from './common/errors/gql.error';
import { RedisModule } from './core/redis/redis.module';

@Module({
  imports: [
    //TODO  Joi
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      cache: true,
    }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    GatewayModule,
    RedisModule,
    // GraphQLModule.forRoot<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   autoSchemaFile: true,
    //   playground: true,
    //   sortSchema: true,
    //   context: ({ req, res }) => ({ req, res }),
    //   formatError: gqlErrorHandler,
    // }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: GqlThrottlerGuard,
    },
  ],
})
export class AppModule {}
