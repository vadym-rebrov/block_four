import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { RoomRepository } from '../room/room.repository';
import * as fs from 'fs/promises'; // Используем promises версию для async/await
import * as path from 'path';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);
    private static readonly DATASET_PATH = "resources/init_data";
    private static readonly ROOM_INIT = "room.init.json"
    constructor(private readonly roomRepository: RoomRepository) {}

    async onModuleInit() {
        await this.seedRooms();
    }

    private async seedRooms() {
        if (await this.roomRepository.isEmpty()) {
            this.logger.log('Room collection is empty. Loading seed data from file...');
            try {
                const filePath = path.join(process.cwd(), SeedService.DATASET_PATH, SeedService.ROOM_INIT);
                const fileData = await fs.readFile(filePath, 'utf-8');
                const roomsToInsert = JSON.parse(fileData);
                await this.roomRepository.createMany(roomsToInsert);
                this.logger.log(`Successfully seeded ${roomsToInsert.length} rooms.`);
            } catch (error) {
                this.logger.error('Failed to seed rooms', error);
            }
        }
    }
}