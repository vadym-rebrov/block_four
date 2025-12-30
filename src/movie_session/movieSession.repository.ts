import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {MovieSession, MovieSessionDocument} from './movieSession.schema';
import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";

@Injectable()
export class MovieSessionRepository {
    constructor(
        @InjectModel(MovieSession.name) private readonly model: Model<MovieSessionDocument>,
    ) {}

    async getById(id: string): Promise<MovieSession | null> {
        return this.model.findById(id).lean();
    }

    async create(data: SaveMovieSessionDto): Promise<string> {
        if (!data.tickets) {

        }
        const session = await this.model.create(data);
        return session.id;
    }

    async update(id: string, data: SaveMovieSessionDto): Promise<void> {
        await this.model.updateOne({ _id: id }, { $set: data });
    }

}