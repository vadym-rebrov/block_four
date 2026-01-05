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
import {SaveRoomDto} from "../room/dto/saveRoom.dto";

@Injectable()
export class MovieSessionRepository {
    constructor(
        @InjectModel(MovieSession.name) private readonly sessionModel: Model<MovieSessionDocument>,
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

    async countByMovieId(movieId:number) : Promise<number>{
        return this.sessionModel.countDocuments({
            'movie.ext_id': movieId
        });
    }


    public async getConflictSession(roomNumber: number, start: Date, end: Date): Promise<MovieSession | null> {
        return this.sessionModel.findOne({
            roomNumber: roomNumber,
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

    async create(data: SaveMovieSessionDto): Promise<MovieSession> {
        return this.sessionModel.create(data);
    }

    async createMany(data: SaveMovieSessionDto[]): Promise<string[]> {
        const sessions = await this.sessionModel.insertMany(data);
        return sessions.map(s => s.id);
    }

    async isEmpty() : Promise<boolean> {
        const count = await this.sessionModel.countDocuments({});
        return count === 0;
    }


}