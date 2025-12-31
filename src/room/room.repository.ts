import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Room, RoomDocument } from './room.schema';
import {SaveRoomDto} from "./dto/saveRoom.dto";


@Injectable()
export class RoomRepository {
    constructor(
        @InjectModel(Room.name) private readonly model: Model<RoomDocument>,
    ) {}

    async get(id: string): Promise<Room | null> {
        return this.model.findById(id).lean();
    }

    async getByRoomNumber(roomNumber: number): Promise<Room | null> {
        return this.model.findOne({ roomNumber }).lean();
    }

    async create(data: SaveRoomDto): Promise<string> {
        const room = await this.model.create(data);
        return room.id;
    }

    async createMany(data: SaveRoomDto[]) : Promise<string []>{
        const rooms = await this.model.insertMany(data);
        return rooms.map(room => room.id);
    }

    async isEmpty() : Promise<boolean> {
        const count = await this.model.countDocuments({});
        return count === 0;
    }

}