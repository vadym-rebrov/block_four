import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RoomRepository } from '../room/room.repository';
import * as fs from 'fs/promises';
import * as path from 'path';
import {MovieSessionRepository} from "../movie_session/movieSession.repository";

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);
    private static readonly DATASET_PATH = "resources/init_data";
    private static readonly ROOM_FILENAME = "room.init.json";
    private static readonly MOVIE_SESSION_FILENAME = "movieSession.init.json";
    constructor(private readonly roomRepository: RoomRepository, private readonly movieSessionRepository: MovieSessionRepository) {}

    async onModuleInit() {
        await this.seedRooms();
        await this.seedMovieSession();
    }

    private async seedRooms(){
        if (await this.roomRepository.isEmpty()) {
            this.logger.log('Room collection is empty. Loading seed data from file...');
            await this.seedCollection(SeedService.ROOM_FILENAME, this.roomRepository);
        }
    }

    private async seedMovieSession(){
        if (await this.movieSessionRepository.isEmpty()) {
            this.logger.log('Movie collection is empty. Loading seed data from file...');
            await this.seedCollection(SeedService.MOVIE_SESSION_FILENAME, this.movieSessionRepository);
        }
    }

    private async seedCollection(initDataFilename: string, repository) {
        try {
            const filePath = path.join(process.cwd(), SeedService.DATASET_PATH, initDataFilename);
            const fileData = await fs.readFile(filePath, 'utf-8');
            const roomsToInsert = JSON.parse(fileData);
            await repository.createMany(roomsToInsert);
            this.logger.log(`Successfully seeded ${roomsToInsert.length}.`);
        } catch (error) {
            this.logger.error('Failed to seed: ', error);
        }
    }


}