import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {MovieSessionModule} from './movie_session/movieSession.module';
import {SeedService} from './seed/seed.service';
import {RoomModule} from './room/room.module';
import {AuthModule} from "./security/auth.module";
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule, AuthModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_ADDRESS'),
      }),
    }),
    MovieSessionModule,
    RoomModule,
    TerminusModule
  ],
  providers:[
    SeedService
  ],
  controllers: [HealthController]
})
export class AppModule {}
