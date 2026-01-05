import {Injectable} from "@nestjs/common";
import {MovieSessionRepository} from "./movieSession.repository";

import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayDto} from "./dto/countByIdArrayDto";
import {CountByIdArrayResponseDto} from "./dto/countByIdArrayResponseDto";
import {plainToInstance} from "class-transformer";
import {MovieSessionInfoDto} from "./dto/movieSessionInfoDto";
import {MovieSessionQueryResponseDto} from "./dto/movieSessionQueryResponseDto";

@Injectable()
export class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository
    ) {}

    public async create(saveDto : SaveMovieSessionDto){
        return this.movieSessionRepository.create(saveDto);
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