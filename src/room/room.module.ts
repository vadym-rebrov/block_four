import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Room, RoomSchema } from './room.schema';
import { RoomRepository } from './room.repository';
import { RoomService } from './room.service';

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: Room.name,
                schema: RoomSchema,
            },
        ]),
    ],
    providers: [RoomService, RoomRepository],
    exports: [RoomRepository],
})
export class RoomModule {}