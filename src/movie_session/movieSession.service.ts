import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
import {MovieSessionRepository} from './movieSession.repository';

import {SaveMovieSessionDto} from './dto/saveMovieSession.dto';
import {MovieSessionQueryDto} from './dto/movieSessionQueryDto';
import {CountByIdArrayDto} from './dto/countByIdArrayDto';
import {CountByIdArrayResponseDto} from './dto/countByIdArrayResponseDto';
import {plainToInstance} from 'class-transformer';
import {MovieSessionInfoDto} from './dto/movieSessionInfoDto';
import {MovieSessionQueryResponseDto} from './dto/movieSessionQueryResponseDto';
import {RoomRepository} from '../room/room.repository';
import {MovieService} from '../movie/movie.service';

@Injectable()
export class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository,
        private readonly roomRepository: RoomRepository,
        private readonly movieService: MovieService
    ) {}

    async create(dto: SaveMovieSessionDto): Promise<string> {
        const preparedData = await this.prepareSessionData(dto);
        const createdSession = await this.movieSessionRepository.create(preparedData);
        return createdSession.id.toString();
    }

    async createMany(dtos: SaveMovieSessionDto[]): Promise<string[]> {
        const preparedDataArray = await Promise.all(
            dtos.map(dto => this.prepareSessionData(dto))
        );
        return this.movieSessionRepository.createMany(preparedDataArray);
    }

    private async prepareSessionData(data: SaveMovieSessionDto): Promise<SaveMovieSessionDto> {
        const start = new Date(data.start);
        const end = new Date(data.end);

        const [movie, room, conflict] = await Promise.all([
            this.movieService.getById(data.movie.ext_id),
            this.roomRepository.getByRoomNumber(data.roomNumber),
            this.movieSessionRepository.getConflictSession(data.roomNumber, start, end)
        ]);

        if (!movie || movie.title !== data.movie.title) {
            throw new NotFoundException(`Movie with id ${data.movie.ext_id} mismatch or not found`);
        }
        if (!room) {
            throw new NotFoundException(`Room ${data.roomNumber} not found`);
        }
        if (conflict) {
            throw new ConflictException(`Room ${data.roomNumber} is busy at this time`);
        }

        let tickets;

        if (data.tickets && data.tickets.length > 0){
            tickets = data.tickets;
        }else{
            tickets = room.seatsTemplate.map(seat => ({
                rowNumber: seat.rowNumber,
                seatNumber: seat.seatNumber,
                isBooked: false,
            }));
        }

        return {
            ...data,
            tickets,
            start: start.toISOString(),
            end: end.toISOString()
        };
    }

    public async findByQuery(query: MovieSessionQueryDto){
        let sessions = await this.movieSessionRepository.findByQuery(query);
        let dtoList = sessions.map((item) => {
            return plainToInstance(MovieSessionInfoDto, item, {
                excludeExtraneousValues: true,
            });
        });
        let totalElements = await this.movieSessionRepository.countByMovieId(query.movieId);
        return new MovieSessionQueryResponseDto(dtoList, totalElements);
    }

    public async countByMovieId(array: CountByIdArrayDto) {
        let countData = await this.movieSessionRepository.countByMovieIds(array.movieIds);
        return new CountByIdArrayResponseDto(countData);
    }
}