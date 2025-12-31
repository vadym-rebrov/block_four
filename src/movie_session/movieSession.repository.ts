import {Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {MovieSession, MovieSessionDocument} from './movieSession.schema';
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {Room, RoomDocument} from "../room/room.schema";
import {RoomRepository} from "../room/room.repository";

@Injectable()
export class MovieSessionRepository {
    constructor(
        @InjectModel(MovieSession.name) private readonly sessionModel: Model<MovieSessionDocument>,
        private readonly roomRepository: RoomRepository,
    ) {}

    async getById(id: string): Promise<MovieSession | null> {
        return this.sessionModel.findById(id).lean();
    }

    async create(data: SaveMovieSessionDto): Promise<string> {
        if (!data.tickets || data.tickets.length === 0) {
            const room = await this.roomRepository.getByRoomNumber(data.room_number);
            if (!room) {
                throw new NotFoundException(`Room with number ${data.room_number} not found`);
            }

            data.tickets = room.seatsTemplate.map(seat => ({
                rowNumber: seat.rowNumber,
                seatNumber: seat.seatNumber,
                isBooked: false,
            }));
        }

        return (await this.sessionModel.create(data)).id;
    }

    async update(id: string, data: SaveMovieSessionDto): Promise<void> {
        await this.sessionModel.updateOne({ _id: id }, { $set: data });
    }

}