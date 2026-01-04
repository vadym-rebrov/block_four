import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {MovieSession, MovieSessionDocument} from './movieSession.schema';
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {Room, RoomDocument} from "../room/room.schema";
import {RoomRepository} from "../room/room.repository";
import {MovieService} from "../movie/movie.service";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayDto} from "./dto/countByIdArrayDto";

@Injectable()
export class MovieSessionRepository {
    constructor(
        @InjectModel(MovieSession.name) private readonly sessionModel: Model<MovieSessionDocument>,
        private readonly roomRepository: RoomRepository,
        private readonly movieService : MovieService
    ) {}

    async getById(id: string): Promise<MovieSession | null> {
        return this.sessionModel.findById(id).lean();
    }

    async findByQuery(query: MovieSessionQueryDto): Promise<MovieSession[]> {
        return this.sessionModel.find({
            'movie.ext_id': query.movieId
        })
        .sort({ start: -1 })
        .skip(query.from)
        .limit(query.size).lean();
    }

    async create(data: SaveMovieSessionDto): Promise<string> {
        if (!data.tickets || data.tickets.length === 0) {
            const [movie, room, conflictingSession] = await Promise.all([
                this.movieService.getById(data.movie.ext_id),
                this.roomRepository.getByRoomNumber(data.room_number),
                this.getConflictSession(data)
            ]);

            if (!movie || movie.title !== data.movie.title) {
                throw new NotFoundException(`Movie with id ${data.movie.ext_id} not found`);
            }

            if (!room) {
                throw new NotFoundException(`Room with number ${data.room_number} not found`);
            }

            if (conflictingSession) {
                throw new ConflictException(
                    `Room ${data.room_number} is already booked from ${conflictingSession.start} to ${conflictingSession.end}`
                );
            }

            data.tickets = room.seatsTemplate.map(seat => ({
                rowNumber: seat.rowNumber,
                seatNumber: seat.seatNumber,
                isBooked: false,
            }));
        }

        return (await this.sessionModel.create(data)).id;
    }

    private async getConflictSession(data: SaveMovieSessionDto){
        const start = new Date(data.start);
        const end = new Date(data.end);

        return this.sessionModel.findOne({
            room_number: data.room_number,
            $and: [
                { start: { $lt: end } },
                { end: { $gt: start } }
            ]
        }).exec();

    }

    public async countByMovieIds(idsArray: number[]): Promise<Map<string, number>> {
        const result = await this.sessionModel.aggregate([
            {
                $match: {
                    'movie.ext_id': { $in: idsArray }
                }
            },
            {
                $group: {
                    _id: '$movie.ext_id',
                    count: { $sum: 1 }
                }
            }
        ]);

        const keyPredicate = 'id';
        const tempMap = new Map<string, number>();
        idsArray.forEach(id => {
            tempMap.set(keyPredicate + id, 0);
        });
        result.forEach(item => {
            tempMap.set(keyPredicate + item._id, item.count);
        });

        const sortedStats = new Map(
            [...tempMap.entries()].sort((a, b) => {
                return b[1] - a[1];
            })
        );

        console.log(sortedStats)
        return sortedStats;
    }

}