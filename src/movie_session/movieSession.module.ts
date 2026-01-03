import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {MovieSession, MovieSessionSchema} from "./movieSession.schema";
import {MovieSessionRepository} from "./movieSession.repository";
import {MovieSessionController} from "./movieSession.controller";
import {MovieSessionService} from "./movieSession.service";
import { RoomModule } from '../room/room.module';
import {MovieService} from "../movie/movie.service";
import {MovieModule} from "../movie/movie.module";

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: MovieSession.name,
                schema: MovieSessionSchema,
            },
        ]),
        RoomModule,
        MovieModule
    ],
    providers: [MovieSessionService, MovieSessionRepository],
    controllers: [MovieSessionController],
    exports: [MovieSessionRepository],
})
export class MovieSessionModule {}