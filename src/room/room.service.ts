import { Injectable } from '@nestjs/common';
import { RoomRepository } from './room.repository';
import { Room } from './room.schema';

@Injectable()
export class RoomService {
    constructor(private readonly roomRepository: RoomRepository) {}

    async get(id: string): Promise<Room | null> {
        return this.roomRepository.get(id);
    }

    async getByRoomNumber(roomNumber: number): Promise<Room | null> {
        return this.roomRepository.getByRoomNumber(roomNumber);
    }

    // async create(data: CreateRoomDto): Promise<string> {
    //     return this.roomRepository.create(data);
    // }

}