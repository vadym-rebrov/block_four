import {Injectable} from "@nestjs/common";
import {MovieSessionRepository} from "./movieSession.repository";

import {SaveMovieSessionDto} from "./dto/saveMovieSession.dto";
import {MovieSessionQueryDto} from "./dto/movieSessionQueryDto";
import {CountByIdArrayDto} from "./dto/countByIdArrayDto";
import {CountByIdArrayResponseDto} from "./dto/countByIdArrayResponseDto";

@Injectable()
export class MovieSessionService {
    constructor(
        private readonly movieSessionRepository: MovieSessionRepository
    ) {}

    public async create(saveDto : SaveMovieSessionDto){
        return this.movieSessionRepository.create(saveDto);
    }

    public async findByQuery(query: MovieSessionQueryDto){
        return this.movieSessionRepository.findByQuery(query);
    }

    public async countByMovieId(array: CountByIdArrayDto) {
        let countData = await this.movieSessionRepository.countByMovieIds(array.movieIds);
        return new CountByIdArrayResponseDto(countData);
    }
}