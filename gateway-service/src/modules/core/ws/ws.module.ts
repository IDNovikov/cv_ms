import { Global, Module } from '@nestjs/common';
import { WSService } from './ws.service';

@Global()
@Module({
  providers: [WSService],
  exports: [WSService],
})
export class WebsocketModule {}
// import { Module } from "@nestjs/common";

// @Module({
//   // imports: [
//   //   ChatModule,
//   //   JwtModule.registerAsync({
//   //     imports: [ConfigModule],
//   //     inject: [ConfigService],
//   //     useFactory: (cfg: ConfigService) => ({
//   //       secret: cfg.get('JWT_SECRET'),
//   //       signOptions: { expiresIn: '15m' },
//   //     }),
//   //   }),
//   // ],

//   providers: [
//     WSRoot,
//     WSChatGateway,
//     ChatWsEventsAdapter,
//     {
//       provide: ChatEventsPort,
//       useClass: ChatWsEventsAdapter,
//     },
//     ChatWsEventsAdapter,
//   ],
//   exports: [WSChatGateway],
// })
// export class WSModule {}
