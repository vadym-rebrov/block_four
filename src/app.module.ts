import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health/health.controller';
import { GroupModule } from './group/group.module';
import { StudentModule } from './student/student.module';
import {MovieSession} from "./movie_session/movieSession.schema";
import {MovieSessionModule} from "./movie_session/movieSession.module";
import {SeedService} from "./seed/seed.service";
import {RoomModule} from "./room/room.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_ADDRESS'),
      }),
    }),
    GroupModule,
    StudentModule,
    MovieSessionModule,
    RoomModule

  ],
  providers:[
    SeedService
  ],
  controllers: [HealthController],
})
export class AppModule {}
